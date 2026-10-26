import { Check } from 'lucide-react';
import { type KeyboardEvent, useEffect, useLayoutEffect, useRef } from 'react';
import { useLeafConfig } from '../config-provider/context';
import { ScrollbarControl } from '../scrollbar/scrollbar';
import { type TimeParts, timeInRange, timeValue } from '../shared/time';

interface TimePanelProps {
  value: TimeParts;
  onChange: (value: TimeParts) => void;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  disabledTime?: (parts: TimeParts) => boolean;
  minTime?: TimeParts | null;
  maxTime?: TimeParts | null;
  startTime?: TimeParts;
  allowOvernight?: boolean;
}
type Unit = keyof TimeParts | 'period';
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const grid = (step: number, current: number) => {
  const size = Number.isFinite(step) ? Math.max(1, Math.min(60, Math.floor(step))) : 1;
  return [
    ...new Set([...Array.from({ length: Math.ceil(60 / size) }, (_, i) => i * size), current]),
  ].sort((a, b) => a - b);
};

/** Shared hour/minute/second columns for every time-enabled picker. */
export function TimePanel({
  value,
  onChange,
  showSeconds = false,
  use12Hours = false,
  minuteStep = 1,
  secondStep = 1,
  disabledTime,
  minTime,
  maxTime,
  startTime,
  allowOvernight = false,
}: TimePanelProps) {
  const { messages } = useLeafConfig();
  const units: Unit[] = [
    'hour',
    'minute',
    ...(showSeconds ? ['second' as const] : []),
    ...(use12Hours ? ['period' as const] : []),
  ];
  const minutes = grid(minuteStep, value.minute);
  const seconds = showSeconds ? grid(secondStep, value.second) : [0];
  const allowed = (next: TimeParts) =>
    timeInRange(next, minTime, maxTime) &&
    !disabledTime?.(next) &&
    (!startTime || allowOvernight || timeValue(next) >= timeValue(startTime));
  const selected = (unit: Unit) =>
    unit === 'period'
      ? Math.floor(value.hour / 12)
      : unit === 'hour' && use12Hours
        ? value.hour % 12 || 12
        : value[unit];
  const columns = units.map((unit) => {
    const numbers =
      unit === 'hour'
        ? Array.from({ length: use12Hours ? 12 : 24 }, (_, i) => (use12Hours ? i + 1 : i))
        : unit === 'period'
          ? [0, 1]
          : unit === 'minute'
            ? minutes
            : seconds;
    const candidate = (number: number): TimeParts | null => {
      const hour =
        unit === 'hour'
          ? use12Hours
            ? (number % 12) + Math.floor(value.hour / 12) * 12
            : number
          : unit === 'period'
            ? (value.hour % 12) + number * 12
            : value.hour;
      const base = { ...value, hour, second: showSeconds ? value.second : 0 };
      if (unit === 'minute' || unit === 'second') base[unit] = number;
      if (allowed(base)) return base;
      // An hour remains selectable if any of its minute/second combinations is valid.
      if (unit === 'hour' || unit === 'period' || unit === 'minute') {
        const hours =
          unit === 'period'
            ? [hour, ...Array.from({ length: 12 }, (_, i) => i + number * 12)]
            : [hour];
        for (const hour of hours)
          for (const minute of unit === 'minute' ? [number] : [value.minute, ...minutes])
            for (const second of [base.second, ...seconds]) {
              const next = { hour, minute, second };
              if (allowed(next)) return next;
            }
      }
      return null;
    };
    return {
      unit,
      selected: selected(unit),
      options: numbers.map((number) => ({ number, next: candidate(number) })),
    };
  });
  return (
    <div
      className="leaf-time-picker__columns"
      data-seconds={showSeconds || undefined}
      data-period={use12Hours || undefined}
    >
      {columns.map((column) => (
        <TimeColumn
          key={column.unit}
          {...column}
          label={
            column.unit === 'hour'
              ? messages.timePicker.hours
              : column.unit === 'minute'
                ? messages.timePicker.minutes
                : column.unit === 'second'
                  ? messages.timePicker.seconds
                  : messages.timePicker.period
          }
          periods={[messages.timePicker.am, messages.timePicker.pm]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
interface TimeColumnProps {
  unit: Unit;
  label: string;
  selected: number;
  options: { number: number; next: TimeParts | null }[];
  periods: readonly [string, string];
  onChange: (value: TimeParts) => void;
}
function TimeColumn({ unit, label, selected, options, periods, onChange }: TimeColumnProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const tabValue =
    options.find((option) => option.number === selected && option.next)?.number ??
    options.find((option) => option.next)?.number;
  const keepVisible = (number: number, center = false) => {
    const node = viewport.current;
    const row = node?.querySelector<HTMLElement>(`[data-time-value="${number}"]`);
    if (!node || !row) return;
    if (center)
      node.scrollTop = Math.max(0, row.offsetTop - (node.clientHeight - row.offsetHeight) / 2);
    else if (row.offsetTop < node.scrollTop) node.scrollTop = row.offsetTop;
    else if (row.offsetTop + row.offsetHeight > node.scrollTop + node.clientHeight)
      node.scrollTop = row.offsetTop + row.offsetHeight - node.clientHeight;
  };
  useBrowserLayoutEffect(() => {
    if (tabValue === undefined) return;
    const place = () => keepVisible(tabValue, true);
    place();
    if (typeof ResizeObserver === 'undefined' || !viewport.current) return;
    const observer = new ResizeObserver(place);
    observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [tabValue]);
  const key = (event: KeyboardEvent<HTMLButtonElement>, number: number) => {
    const available = options.filter((option) => option.next);
    const index = available.findIndex((option) => option.number === number);
    let next: number;
    if (event.key === 'ArrowDown') next = (index + 1) % available.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + available.length) % available.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = available.length - 1;
    else if (event.key === 'PageDown') next = Math.min(available.length - 1, index + 7);
    else if (event.key === 'PageUp') next = Math.max(0, index - 7);
    else return;
    event.preventDefault();
    const target = available[next];
    if (!target?.next) return;
    onChange(target.next);
    viewport.current
      ?.querySelector<HTMLButtonElement>(`[data-time-value="${target.number}"]`)
      ?.focus({ preventScroll: true });
    keepVisible(target.number);
  };
  return (
    <div className="leaf-time-picker__column-wrap" data-time-unit={unit}>
      <div className="leaf-time-picker__column-label">{label}</div>
      <ScrollbarControl
        ref={viewport}
        persistent
        orientation="vertical"
        size="sm"
        viewportClassName="leaf-time-picker__column"
        contentClassName="leaf-time-picker__options"
        role="listbox"
        aria-label={label}
        height="var(--leaf-time-column-height, 252px)"
        tabIndex={-1}
        scrollbarTabIndex={-1}
      >
        {options.map(({ number, next }) => (
          <button
            key={number}
            type="button"
            role="option"
            data-time-value={number}
            disabled={!next}
            tabIndex={number === tabValue ? 0 : -1}
            aria-selected={number === selected}
            className="leaf-floating__option"
            onClick={() => next && onChange(next)}
            onKeyDown={(event) => key(event, number)}
          >
            <span>{unit === 'period' ? periods[number] : String(number).padStart(2, '0')}</span>
            <Check size={12} aria-hidden="true" className="leaf-time-picker__check" />
          </button>
        ))}
      </ScrollbarControl>
    </div>
  );
}
