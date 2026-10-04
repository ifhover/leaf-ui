import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from './classes';
import { calendarDays, dateKey, formatMonthLabel, sameDate, shiftMonth } from './date';

export type CalendarMode = 'year' | 'quarter' | 'month' | 'week' | 'date' | 'datetime';
export function startOfPeriod(date: Date, mode: CalendarMode) {
  const next = new Date(date);
  next.setMilliseconds(0);
  if (mode !== 'datetime') next.setHours(0, 0, 0, 0);
  if (mode === 'year') next.setMonth(0, 1);
  if (mode === 'month') next.setDate(1);
  if (mode === 'quarter') next.setMonth(Math.floor(next.getMonth() / 3) * 3, 1);
  if (mode === 'week') next.setDate(next.getDate() - ((next.getDay() + 6) % 7));
  return next;
}
export function dateTimeKey(date: Date, showSeconds = true) {
  return (
    dateKey(date) +
    ' ' +
    [date.getHours(), date.getMinutes(), ...(showSeconds ? [date.getSeconds()] : [])]
      .map((n) => String(n).padStart(2, '0'))
      .join(':')
  );
}
export function periodKey(date: Date, mode: CalendarMode) {
  if (mode === 'year') return String(date.getFullYear());
  if (mode === 'month') return dateKey(date).slice(0, 7);
  if (mode === 'quarter') return `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`;
  if (mode === 'datetime') return dateTimeKey(date);
  if (mode === 'week') {
    const monday = startOfPeriod(date, 'week');
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3);
    const first = startOfPeriod(new Date(thursday.getFullYear(), 0, 4), 'week');
    const weeks = Math.round(
      (Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()) -
        Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())) /
        604800000,
    );
    return `${thursday.getFullYear()}-W${String(weeks + 1).padStart(2, '0')}`;
  }
  return dateKey(date);
}
export function withinPeriod(date: Date, mode: CalendarMode, min?: Date, max?: Date) {
  const time = startOfPeriod(date, mode).getTime();
  return (
    Number.isFinite(time) &&
    (!min || time >= startOfPeriod(min, mode).getTime()) &&
    (!max || time <= startOfPeriod(max, mode).getTime())
  );
}
export function shiftCalendar(date: Date, mode: CalendarMode, amount: number) {
  if (mode === 'year') return new Date(date.getFullYear() + amount * 12, 0, 1);
  if (mode === 'month' || mode === 'quarter') return new Date(date.getFullYear() + amount, 0, 1);
  return shiftMonth(date, amount);
}
interface CalendarPanelProps {
  value?: Date | null;
  onChange: (date: Date) => void;
  picker?: CalendarMode;
  minDate?: Date;
  maxDate?: Date;
  visibleDate?: Date;
  onVisibleChange?: (date: Date) => void;
  autoFocus?: boolean;
  range?: readonly [Date | null, Date | null];
  hoverDate?: Date | null;
  onHover?: (date: Date) => void;
  headerExtra?: ReactNode;
  showOutsideDays?: boolean;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date) => ReactNode;
  showToday?: boolean;
}
export function CalendarPanel({
  value,
  onChange,
  picker = 'date',
  minDate,
  maxDate,
  visibleDate,
  onVisibleChange,
  autoFocus,
  range,
  hoverDate,
  onHover,
  headerExtra,
  showOutsideDays = true,
  disabledDate,
  cellRender,
  showToday = false,
}: CalendarPanelProps) {
  const { locale, messages } = useLeafConfig();
  const initial = value ?? minDate ?? new Date();
  const [view, setView] = useState<'year' | 'quarter' | 'month' | 'date'>(
    picker === 'year' || picker === 'month' || picker === 'quarter' ? picker : 'date',
  );
  useEffect(() => {
    setView(picker === 'year' || picker === 'month' || picker === 'quarter' ? picker : 'date');
  }, [picker]);
  const [internalVisible, setInternalVisible] = useState(initial);
  const visible = visibleDate ?? internalVisible;
  const [active, setActive] = useState(initial);
  const root = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const valueTime = value?.getTime();
  const controlledVisible = visibleDate !== undefined;
  useEffect(() => {
    if (valueTime !== undefined) {
      const next = new Date(valueTime);
      setActive(next);
      if (!controlledVisible) setInternalVisible(next);
    }
  }, [valueTime, controlledVisible]);
  useEffect(() => {
    if (autoFocus) focusRequested.current = true;
  }, [autoFocus]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Only keyboard navigation requests focus, not hover or selection changes.
  useEffect(() => {
    if (focusRequested.current) {
      root.current
        ?.querySelector<HTMLButtonElement>('[data-active="true"]:not(:disabled)')
        ?.focus();
      focusRequested.current = false;
    }
  }, [active, view, visible, autoFocus]);
  const setVisible = (date: Date) => {
    if (onVisibleChange) onVisibleChange(date);
    else setInternalVisible(date);
  };
  const decade = Math.floor(visible.getFullYear() / 12) * 12;
  const cells =
    view === 'year'
      ? Array.from({ length: 12 }, (_, i) => new Date(decade + i, 0, 1))
      : view === 'quarter'
        ? Array.from({ length: 4 }, (_, i) => new Date(visible.getFullYear(), i * 3, 1))
        : view === 'month'
          ? Array.from({ length: 12 }, (_, i) => new Date(visible.getFullYear(), i, 1))
          : calendarDays(visible);
  const cellMode = view === 'date' ? (picker === 'datetime' ? 'date' : picker) : view;
  const focusableCells = cells.filter(
    (date) =>
      (showOutsideDays || view !== 'date' || date.getMonth() === visible.getMonth()) &&
      withinPeriod(date, cellMode, minDate, maxDate) &&
      !(view === picker && disabledDate?.(date)),
  );
  const activeCell =
    focusableCells.find((date) =>
      view === 'date'
        ? sameDate(date, active)
        : startOfPeriod(date, cellMode).getTime() === startOfPeriod(active, cellMode).getTime(),
    ) ?? focusableCells[0];
  const samePeriod = (date: Date, candidate?: Date | null) =>
    Boolean(
      candidate &&
        startOfPeriod(date, cellMode).getTime() === startOfPeriod(candidate, cellMode).getTime(),
    );
  const choose = (date: Date) => {
    if (view === 'year' && picker !== 'year') {
      setVisible(date);
      setActive(date);
      setView(picker === 'quarter' ? 'quarter' : 'month');
      focusRequested.current = true;
    } else if (view === 'month' && picker !== 'month') {
      setVisible(date);
      setActive(date);
      setView('date');
      focusRequested.current = true;
    } else onChange(startOfPeriod(date, picker === 'datetime' ? 'date' : picker));
  };
  const move = (date: Date, event: KeyboardEvent<HTMLButtonElement>) => {
    const next = new Date(date);
    const delta =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : event.key === 'ArrowUp'
            ? view === 'date'
              ? -7
              : -3
            : event.key === 'ArrowDown'
              ? view === 'date'
                ? 7
                : 3
              : 0;
    if (delta) {
      if (view === 'date') next.setDate(next.getDate() + delta);
      else if (view === 'month') next.setMonth(next.getMonth() + delta);
      else if (view === 'quarter') next.setMonth(next.getMonth() + delta * 3);
      else next.setFullYear(next.getFullYear() + delta);
    } else if (event.key === 'Home' || event.key === 'End') {
      if (view === 'date')
        next.setDate(
          next.getDate() +
            (event.key === 'Home' ? -((next.getDay() + 6) % 7) : 6 - ((next.getDay() + 6) % 7)),
        );
      else
        next.setTime((event.key === 'Home' ? cells[0] : cells.at(-1))?.getTime() ?? next.getTime());
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const sign = event.key === 'PageUp' ? -1 : 1;
      if (view === 'date') {
        const month = shiftMonth(next, sign);
        next.setTime(
          new Date(
            month.getFullYear(),
            month.getMonth(),
            Math.min(
              next.getDate(),
              new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
            ),
          ).getTime(),
        );
      } else next.setFullYear(next.getFullYear() + sign * (view === 'year' ? 12 : 1));
    } else return;
    event.preventDefault();
    if (minDate && next < startOfPeriod(minDate, cellMode))
      next.setTime(startOfPeriod(minDate, cellMode).getTime());
    if (maxDate && next > startOfPeriod(maxDate, cellMode))
      next.setTime(startOfPeriod(maxDate, cellMode).getTime());
    if (view === picker && disabledDate?.(next)) {
      const step = delta || (event.key === 'End' || event.key === 'PageDown' ? 1 : -1);
      let attempts = 0;
      while (disabledDate(next) && attempts < 366) {
        if (view === 'date') next.setDate(next.getDate() + step);
        else if (view === 'month') next.setMonth(next.getMonth() + step);
        else if (view === 'quarter') next.setMonth(next.getMonth() + step * 3);
        else next.setFullYear(next.getFullYear() + step);
        if (!withinPeriod(next, cellMode, minDate, maxDate)) return;
        attempts += 1;
      }
      if (disabledDate(next)) return;
    }
    setVisible(next);
    setActive(next);
    focusRequested.current = true;
    onHover?.(next);
  };
  const navigate = (direction: number) => {
    const next =
      view === 'date'
        ? shiftMonth(visible, direction)
        : new Date(
            visible.getFullYear() + direction * (view === 'year' ? 12 : 1),
            visible.getMonth(),
            1,
          );
    const nextActive = new Date(next);
    if (view === 'date')
      nextActive.setDate(
        Math.min(active.getDate(), new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()),
      );
    setVisible(next);
    setActive(nextActive);
  };
  const periodNames = [range?.[0], range?.[1] ?? (range?.[0] ? hoverDate : null)] as const;
  const times = periodNames
    .filter((date): date is Date => Boolean(date))
    .map((date) => startOfPeriod(date, cellMode).getTime());
  const start = times.length === 2 ? Math.min(...times) : undefined;
  const end = times.length === 2 ? Math.max(...times) : undefined;
  return (
    <div
      ref={root}
      data-view={view}
      className={classes('leaf-calendar', range && 'leaf-calendar--range')}
    >
      <div className="leaf-date-picker__header">
        <button
          type="button"
          className="leaf-date-picker__nav"
          aria-label={
            view === 'date'
              ? messages.previousMonth
              : view === 'month'
                ? messages.previousYear
                : messages.previousYears
          }
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <div className="leaf-calendar__headings" aria-live="polite">
          {view === 'date' && (
            <button
              type="button"
              className="leaf-calendar__heading"
              aria-label={messages.month}
              onClick={() => setView('month')}
            >
              {new Intl.DateTimeFormat(locale, { month: 'short' }).format(visible)}
            </button>
          )}
          <button
            type="button"
            className="leaf-calendar__heading"
            aria-label={view === 'year' ? undefined : messages.year}
            disabled={view === 'year'}
            onClick={() => setView('year')}
          >
            {view === 'year' ? `${decade} – ${decade + 11}` : visible.getFullYear()}
          </button>
        </div>
        <button
          type="button"
          className="leaf-date-picker__nav"
          aria-label={
            view === 'date'
              ? messages.nextMonth
              : view === 'month'
                ? messages.nextYear
                : messages.nextYears
          }
          onClick={() => navigate(1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        {showToday && (
          <button
            type="button"
            className="leaf-calendar__today"
            onClick={() => {
              const today = new Date();
              setVisible(today);
              setActive(today);
            }}
          >
            {messages.today}
          </button>
        )}
        {headerExtra != null && <span className="leaf-calendar__extra">{headerExtra}</span>}
      </div>
      {view === 'date' && (
        <div className="leaf-calendar__weekdays">
          {messages.weekdays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      )}
      <fieldset
        className={classes(
          'leaf-calendar__cells',
          view !== 'date' && 'leaf-calendar__cells--coarse',
        )}
        aria-label={
          view === 'date' ? formatMonthLabel(visible, locale) : String(visible.getFullYear())
        }
      >
        {cells.map((date) => {
          const outside = view === 'date' && date.getMonth() !== visible.getMonth();
          if (outside && !showOutsideDays)
            return <span key={dateKey(date)} className="leaf-calendar__cell" />;
          const time = startOfPeriod(date, cellMode).getTime();
          const checked = range
            ? range.some((endpoint) => samePeriod(date, endpoint))
            : samePeriod(date, value);
          const hovered = Boolean(range?.[0] && !range[1] && samePeriod(date, hoverDate));
          const isActive = Boolean(
            activeCell &&
              (view === 'date' ? sameDate(date, activeCell) : samePeriod(date, activeCell)),
          );
          const between = start !== undefined && end !== undefined && time >= start && time <= end;
          return (
            <span
              key={dateKey(date)}
              className={classes(
                'leaf-calendar__cell',
                between && start !== end && 'leaf-calendar__cell--range',
                between && time === start && 'leaf-calendar__cell--start',
                between && time === end && 'leaf-calendar__cell--end',
              )}
            >
              <button
                type="button"
                data-active={isActive}
                data-day={dateKey(date)}
                data-range-hover={hovered || undefined}
                tabIndex={isActive ? 0 : -1}
                aria-label={
                  view === 'date'
                    ? dateKey(date)
                    : view === 'month'
                      ? dateKey(date).slice(0, 7)
                      : view === 'quarter'
                        ? periodKey(date, 'quarter')
                        : String(date.getFullYear())
                }
                aria-pressed={checked}
                aria-current={sameDate(date, new Date()) ? 'date' : undefined}
                disabled={
                  !withinPeriod(date, cellMode, minDate, maxDate) ||
                  Boolean(view === picker && disabledDate?.(date))
                }
                className={classes(
                  'leaf-date-picker__day',
                  outside && 'leaf-date-picker__day--outside',
                  (checked || hovered) && 'leaf-date-picker__day--selected',
                )}
                onMouseEnter={() => {
                  if (withinPeriod(date, cellMode, minDate, maxDate)) onHover?.(date);
                }}
                onClick={() => choose(date)}
                onKeyDown={(event) => move(date, event)}
              >
                <span className="leaf-calendar__cell-label">
                  {view === 'date'
                    ? date.getDate()
                    : view === 'month'
                      ? new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
                      : view === 'quarter'
                        ? `Q${Math.floor(date.getMonth() / 3) + 1}`
                        : date.getFullYear()}
                </span>
                {cellRender && view === picker && (
                  <span className="leaf-calendar__cell-content">{cellRender(date)}</span>
                )}
              </button>
            </span>
          );
        })}
      </fieldset>
    </div>
  );
}
