import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { classes } from './classes';
import { calendarDays, dateKey, formatMonthLabel, sameDate, shiftMonth } from './date';

export type CalendarMode = 'year' | 'month' | 'week' | 'weekday' | 'date' | 'datetime';
export function startOfPeriod(date: Date, mode: CalendarMode) {
  const next = new Date(date);
  if (mode !== 'datetime') next.setHours(0, 0, 0, 0);
  if (mode === 'year') next.setMonth(0, 1);
  if (mode === 'month') next.setDate(1);
  if (mode === 'week') next.setDate(next.getDate() - ((next.getDay() + 6) % 7));
  return next;
}
export function dateTimeKey(date: Date) {
  return `${dateKey(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}
export function periodKey(date: Date, mode: CalendarMode) {
  if (mode === 'year') return String(date.getFullYear());
  if (mode === 'month') return dateKey(date).slice(0, 7);
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
    (!min || time >= startOfPeriod(min, mode).getTime()) &&
    (!max || time <= startOfPeriod(max, mode).getTime())
  );
}
interface CalendarPanelProps {
  value: Date;
  onChange: (date: Date) => void;
  picker?: CalendarMode;
  minDate?: Date;
  maxDate?: Date;
  autoFocus?: boolean;
  range?: readonly [Date | null, Date | null];
}
export function CalendarPanel({
  value,
  onChange,
  picker = 'date',
  minDate,
  maxDate,
  autoFocus,
  range,
}: CalendarPanelProps) {
  const { locale, messages } = useLeafConfig();
  const initialView = picker === 'year' || picker === 'month' ? picker : 'date';
  const [view, setView] = useState<'year' | 'month' | 'date'>(initialView);
  const [visible, setVisible] = useState(value);
  const [active, setActive] = useState(value);
  const root = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);
  const wasAutoFocus = useRef(false);
  useEffect(() => {
    setVisible(value);
    setActive(value);
  }, [value]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Focus runs after the grid changes, only when keyboard navigation requested it.
  useEffect(() => {
    if (autoFocus && !wasAutoFocus.current) focusRequested.current = true;
    wasAutoFocus.current = Boolean(autoFocus);
    if (focusRequested.current) {
      root.current
        ?.querySelector<HTMLButtonElement>('[data-active="true"]:not(:disabled)')
        ?.focus();
      focusRequested.current = false;
    }
  }, [active, view, visible, autoFocus]);
  const decade = Math.floor(visible.getFullYear() / 12) * 12;
  const cells =
    view === 'year'
      ? Array.from({ length: 12 }, (_, i) => new Date(decade + i, 0, 1))
      : view === 'month'
        ? Array.from({ length: 12 }, (_, i) => new Date(visible.getFullYear(), i, 1))
        : calendarDays(visible);
  const cellMode = view === 'date' ? (picker === 'datetime' ? 'date' : picker) : view;
  const selected = (date: Date, candidate: Date) =>
    startOfPeriod(date, cellMode).getTime() === startOfPeriod(candidate, cellMode).getTime();
  const choose = (date: Date) => {
    if (view === 'year' && picker !== 'year') {
      setVisible(date);
      setActive(date);
      setView('month');
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
      else next.setFullYear(next.getFullYear() + delta);
    } else if (event.key === 'Home' || event.key === 'End') {
      const first = cells[0];
      const last = cells.at(-1);
      next.setTime((event.key === 'Home' ? first : last)?.getTime() ?? next.getTime());
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
    setVisible(next);
    setActive(next);
    focusRequested.current = true;
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
    setVisible(next);
    setActive(next);
  };
  const prevLabel =
    view === 'date'
      ? messages.previousMonth
      : view === 'month'
        ? messages.previousYear
        : messages.previousYears;
  const nextLabel =
    view === 'date'
      ? messages.nextMonth
      : view === 'month'
        ? messages.nextYear
        : messages.nextYears;
  return (
    <div ref={root} className="leaf-calendar">
      <div className="leaf-date-picker__header">
        <button
          type="button"
          className="leaf-date-picker__nav"
          aria-label={prevLabel}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="leaf-calendar__heading"
          onClick={() => {
            if (view === 'date') setView('month');
            else if (view === 'month') setView('year');
          }}
          disabled={view === 'year'}
          aria-live="polite"
        >
          {view === 'date'
            ? formatMonthLabel(visible, locale)
            : view === 'month'
              ? visible.getFullYear()
              : `${decade} – ${decade + 11}`}
        </button>
        <button
          type="button"
          className="leaf-date-picker__nav"
          aria-label={nextLabel}
          onClick={() => navigate(1)}
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
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
          const checked = range
            ? range.some((endpoint) => endpoint && selected(date, endpoint))
            : selected(date, value);
          const isActive = view === 'date' ? sameDate(date, active) : selected(date, active);
          const start = range?.[0] ? startOfPeriod(range[0], cellMode).getTime() : undefined;
          const end = range?.[1] ? startOfPeriod(range[1], cellMode).getTime() : undefined;
          const time = startOfPeriod(date, cellMode).getTime();
          const inRange =
            start !== undefined &&
            end !== undefined &&
            time >= Math.min(start, end) &&
            time <= Math.max(start, end);
          return (
            <button
              key={dateKey(date)}
              type="button"
              data-active={isActive}
              data-day={dateKey(date)}
              tabIndex={isActive ? 0 : -1}
              aria-label={
                view === 'date'
                  ? dateKey(date)
                  : view === 'month'
                    ? dateKey(date).slice(0, 7)
                    : String(date.getFullYear())
              }
              aria-pressed={checked}
              aria-current={sameDate(date, new Date()) ? 'date' : undefined}
              disabled={!withinPeriod(date, cellMode, minDate, maxDate)}
              className={classes(
                'leaf-date-picker__day',
                view === 'date' &&
                  date.getMonth() !== visible.getMonth() &&
                  'leaf-date-picker__day--outside',
                checked && 'leaf-date-picker__day--selected',
                inRange && !checked && 'leaf-calendar__in-range',
              )}
              onClick={() => choose(date)}
              onKeyDown={(event) => move(date, event)}
            >
              {view === 'date'
                ? date.getDate()
                : view === 'month'
                  ? new Intl.DateTimeFormat(locale, { month: 'short' }).format(date)
                  : date.getFullYear()}
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}
