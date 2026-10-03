import { Check } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { padTime, type TimeParts } from '../shared/time';

interface TimePanelProps {
  value: TimeParts;
  onChange: (value: TimeParts) => void;
  showSeconds?: boolean;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  autoFocus?: boolean;
}
export function TimePanel({
  value,
  onChange,
  showSeconds,
  use12Hours,
  minuteStep = 5,
  secondStep = 1,
  autoFocus,
}: TimePanelProps) {
  const { messages } = useLeafConfig();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
  }, [autoFocus]);
  const options = (step: number, selected: number) => {
    const safe = Number.isFinite(step) ? Math.max(1, Math.min(60, Math.floor(step))) : 1;
    return [
      ...new Set([...Array.from({ length: Math.ceil(60 / safe) }, (_, i) => i * safe), selected]),
    ].sort((a, b) => a - b);
  };
  const column = (
    label: string,
    choices: number[],
    selected: number,
    change: (next: number) => void,
    labels?: string[],
  ) => {
    const key = (event: KeyboardEvent<HTMLButtonElement>, current: number) => {
      const index = choices.indexOf(current);
      let next = index;
      if (event.key === 'ArrowDown') next = (index + 1) % choices.length;
      else if (event.key === 'ArrowUp') next = (index - 1 + choices.length) % choices.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = choices.length - 1;
      else return;
      event.preventDefault();
      change(choices[next] ?? current);
      const node =
        event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next];
      node?.focus();
      node?.scrollIntoView?.({ block: 'nearest' });
    };
    return (
      <div className="leaf-time-picker__column-wrap" key={label}>
        <div className="leaf-time-picker__column-label" aria-hidden="true">
          {label}
        </div>
        <div className="leaf-time-picker__column" role="listbox" aria-label={label}>
          {choices.map((option) => (
            <button
              type="button"
              key={option}
              role="option"
              tabIndex={option === selected ? 0 : -1}
              aria-selected={option === selected}
              className="leaf-floating__option"
              ref={(node) => {
                if (node && option === selected) node.scrollIntoView?.({ block: 'nearest' });
              }}
              onClick={() => change(option)}
              onKeyDown={(event) => key(event, option)}
            >
              <span>{labels?.[option] ?? padTime(option)}</span>
              <Check
                size={14}
                aria-hidden="true"
                style={{ opacity: option === selected ? 1 : 0 }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };
  const hours = use12Hours
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);
  return (
    <div ref={ref} className="leaf-time-picker__columns">
      {column(messages.hours, hours, use12Hours ? value.hour % 12 || 12 : value.hour, (hour) =>
        onChange({ ...value, hour: use12Hours ? (hour % 12) + (value.hour < 12 ? 0 : 12) : hour }),
      )}
      {column(messages.minutes, options(minuteStep, value.minute), value.minute, (minute) =>
        onChange({ ...value, minute }),
      )}
      {showSeconds &&
        column(messages.seconds, options(secondStep, value.second), value.second, (second) =>
          onChange({ ...value, second }),
        )}
      {use12Hours &&
        column(
          messages.period,
          [0, 1],
          value.hour < 12 ? 0 : 1,
          (period) => onChange({ ...value, hour: (value.hour % 12) + period * 12 }),
          [messages.am, messages.pm],
        )}
    </div>
  );
}
