import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { classes } from '../shared/classes';
import { calendarDays, dateKey, sameDate } from '../shared/date';
import { useContentTransition } from '../shared/presence';

export interface CalendarProps
  extends Omit<HTMLAttributes<HTMLElement>, 'onChange' | 'defaultValue'> {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  visibleDate?: Date;
  onVisibleChange?: (date: Date) => void;
  mode?: 'date' | 'month';
  fullscreen?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDate?: (date: Date) => boolean;
  cellRender?: (date: Date) => ReactNode;
  headerExtra?: ReactNode;
  showToday?: boolean;
}

type CalendarView = 'days' | 'months';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addDays = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const sameMonth = (left?: Date | null, right?: Date | null) =>
  Boolean(left && right && monthIndex(left) === monthIndex(right));
const validDate = (date?: Date | null) =>
  date && Number.isFinite(date.getTime()) ? date : undefined;
/** Move by whole months while keeping the day inside shorter target months. */
function addMonths(date: Date, amount: number) {
  const month = new Date(date.getFullYear(), date.getMonth() + amount, 1);
  return new Date(
    month.getFullYear(),
    month.getMonth(),
    Math.min(date.getDate(), daysInMonth(month)),
  );
}
function hasContent(node: ReactNode) {
  return node !== null && node !== undefined && node !== false && node !== '';
}

export function Calendar(rawProps: CalendarProps) {
  const {
    value,
    defaultValue,
    onChange,
    visibleDate,
    onVisibleChange,
    mode = 'date',
    fullscreen = true,
    minDate,
    maxDate,
    disabledDate,
    cellRender,
    headerExtra,
    showToday = true,
    className,
    'aria-label': label,
    ...props
  } = useComponentProps('Calendar', rawProps);
  const { locale, messages, weekStartsOn, direction } = useLeafConfig();
  const uid = useId();
  const titleId = `${uid}-title`;
  const rtl = direction === 'rtl';
  const [internal, setInternal] = useState(defaultValue);
  const selected = validDate(value ?? internal);
  const initial = () =>
    validDate(visibleDate) ??
    validDate(value) ??
    validDate(defaultValue) ??
    validDate(minDate) ??
    new Date();
  const [ownVisible, setOwnVisible] = useState(() => startOfMonth(initial()));
  const controlledVisible = validDate(visibleDate) !== undefined;
  const visible = startOfMonth(validDate(visibleDate) ?? ownVisible);
  const [view, setView] = useState<CalendarView>(mode === 'month' ? 'months' : 'days');
  const [active, setActive] = useState(() => startOfDay(initial()));
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const focusRequested = useRef(false);

  useEffect(() => {
    setView(mode === 'month' ? 'months' : 'days');
  }, [mode]);
  const valueTime = value?.getTime();
  useEffect(() => {
    if (valueTime === undefined || !Number.isFinite(valueTime)) return;
    const next = new Date(valueTime);
    setActive(startOfDay(next));
    if (!controlledVisible) setOwnVisible(startOfMonth(next));
  }, [valueTime, controlledVisible]);
  // Only keyboard navigation and view changes request focus; hover and clicks never move it.
  useEffect(() => {
    if (!focusRequested.current) return;
    focusRequested.current = false;
    root.current?.querySelector<HTMLButtonElement>('[data-active="true"]:not(:disabled)')?.focus();
  });

  // Slide the grid in the reading direction of a period change; switching views only fades.
  const period = view === 'days' ? monthIndex(visible) : visible.getFullYear();
  const previous = useRef({ view, period });
  const travel =
    previous.current.view === view
      ? Math.sign(period - previous.current.period) * (rtl ? -1 : 1)
      : 0;
  useEffect(() => {
    previous.current = { view, period };
  });
  useContentTransition(body, `${view}:${period}`, travel);

  const today = startOfDay(new Date());
  const min = validDate(minDate);
  const max = validDate(maxDate);
  const minDay = min && startOfDay(min);
  const maxDay = max && startOfDay(max);
  const dayInRange = (date: Date) =>
    (!minDay || date.getTime() >= minDay.getTime()) &&
    (!maxDay || date.getTime() <= maxDay.getTime());
  const monthInRange = (month: Date) =>
    (!minDay || monthIndex(month) >= monthIndex(minDay)) &&
    (!maxDay || monthIndex(month) <= monthIndex(maxDay));
  const dayDisabled = (date: Date) =>
    !dayInRange(date) || Boolean(mode === 'date' && disabledDate?.(date));
  const monthDisabled = (month: Date) =>
    !monthInRange(month) || Boolean(mode === 'month' && disabledDate?.(month));

  const changeVisible = (next: Date) => {
    const month = startOfMonth(next);
    if (monthIndex(month) === monthIndex(visible)) return;
    if (!controlledVisible) setOwnVisible(month);
    onVisibleChange?.(month);
  };
  const commit = (next: Date) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };
  const withActiveDay = (month: Date) =>
    new Date(month.getFullYear(), month.getMonth(), Math.min(active.getDate(), daysInMonth(month)));

  const days = calendarDays(visible, weekStartsOn);
  const weeks = Array.from({ length: days.length / 7 }, (_, row) =>
    days.slice(row * 7, row * 7 + 7),
  );
  const months = Array.from(
    { length: 12 },
    (_, index) => new Date(visible.getFullYear(), index, 1),
  );
  const candidates = [active, selected, today].filter((date): date is Date => Boolean(date));
  const activeDay =
    view === 'days'
      ? (candidates
          .map(startOfDay)
          .find((date) => sameMonth(date, visible) && !dayDisabled(date)) ??
        days.find((date) => sameMonth(date, visible) && !dayDisabled(date)))
      : undefined;
  const activeMonth =
    view === 'months'
      ? (candidates
          .map(startOfMonth)
          .find(
            (month) => month.getFullYear() === visible.getFullYear() && !monthDisabled(month),
          ) ?? months.find((month) => !monthDisabled(month)))
      : undefined;

  const chooseDay = (date: Date) => {
    const next = startOfDay(date);
    setActive(next);
    changeVisible(next);
    commit(next);
  };
  const chooseMonth = (month: Date) => {
    if (mode === 'month') {
      setActive(month);
      commit(month);
      return;
    }
    // In date mode a month tile is navigation: open that month and focus the matching day.
    setActive(withActiveDay(month));
    changeVisible(month);
    setView('days');
    focusRequested.current = true;
  };
  const canNavigate = (sign: number) => {
    if (view === 'days') {
      const target = monthIndex(visible) + sign;
      return sign < 0
        ? !minDay || target >= monthIndex(minDay)
        : !maxDay || target <= monthIndex(maxDay);
    }
    const year = visible.getFullYear() + sign;
    return sign < 0
      ? !minDay || year >= minDay.getFullYear()
      : !maxDay || year <= maxDay.getFullYear();
  };
  const navigate = (sign: number) => {
    const amount = view === 'days' ? sign : sign * 12;
    setActive(addMonths(active, amount));
    changeVisible(addMonths(visible, amount));
  };
  const goToday = () => {
    setActive(today);
    changeVisible(today);
  };

  const moveDay = (from: Date, event: KeyboardEvent<HTMLButtonElement>) => {
    const offset = (from.getDay() - weekStartsOn + 7) % 7;
    const back = rtl ? 1 : -1;
    const steps: Record<string, [Date, number]> = {
      ArrowLeft: [addDays(from, back), back],
      ArrowRight: [addDays(from, -back), -back],
      ArrowUp: [addDays(from, -7), -1],
      ArrowDown: [addDays(from, 7), 1],
      Home: [addDays(from, -offset), 1],
      End: [addDays(from, 6 - offset), -1],
      PageUp: [addMonths(from, event.shiftKey ? -12 : -1), -1],
      PageDown: [addMonths(from, event.shiftKey ? 12 : 1), 1],
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    let [next] = step;
    if (minDay && next < minDay) next = minDay;
    if (maxDay && next > maxDay) next = maxDay;
    // Skip business-disabled days in the travel direction without leaving the allowed range.
    for (let attempts = 0; dayDisabled(next) && attempts < 366; attempts += 1) {
      next = addDays(next, step[1]);
      if (!dayInRange(next)) return;
    }
    if (dayDisabled(next)) return;
    setActive(next);
    changeVisible(next);
    focusRequested.current = true;
  };
  const moveMonth = (from: Date, event: KeyboardEvent<HTMLButtonElement>) => {
    // Vertical movement follows the rendered column count, which responds to container width.
    const template = body.current ? getComputedStyle(body.current).gridTemplateColumns : '';
    const columns =
      (template && template !== 'none' && template.trim().split(/\s+/).length) ||
      (fullscreen ? 4 : 3);
    const back = rtl ? 1 : -1;
    const delta: Record<string, number> = {
      ArrowLeft: back,
      ArrowRight: -back,
      ArrowUp: -columns,
      ArrowDown: columns,
      PageUp: -12,
      PageDown: 12,
    };
    let next: Date;
    let step: number;
    if (event.key === 'Home') [next, step] = [new Date(from.getFullYear(), 0, 1), 1];
    else if (event.key === 'End') [next, step] = [new Date(from.getFullYear(), 11, 1), -1];
    else if (delta[event.key]) {
      const amount = delta[event.key] as number;
      step = Math.sign(amount);
      next = new Date(from.getFullYear(), from.getMonth() + amount, 1);
    } else return;
    event.preventDefault();
    if (minDay && monthIndex(next) < monthIndex(minDay)) next = startOfMonth(minDay);
    if (maxDay && monthIndex(next) > monthIndex(maxDay)) next = startOfMonth(maxDay);
    for (let attempts = 0; monthDisabled(next) && attempts < 120; attempts += 1) {
      next = new Date(next.getFullYear(), next.getMonth() + step, 1);
      if (!monthInRange(next)) return;
    }
    if (monthDisabled(next)) return;
    setActive(mode === 'month' ? next : withActiveDay(next));
    changeVisible(next);
    focusRequested.current = true;
  };

  const dayFormat = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const monthDayFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const monthFormat = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' });
  const monthNameFormat = new Intl.DateTimeFormat(locale, { month: fullscreen ? 'long' : 'short' });
  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long' });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const weekdayNarrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
  // 2024-01-07 is a Sunday, so adding a JS weekday index yields that weekday.
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const weekday = (weekStartsOn + index) % 7;
    const date = new Date(2024, 0, 7 + weekday);
    return {
      key: weekday,
      long: weekdayLong.format(date),
      short: fullscreen
        ? weekdayShort.format(date)
        : (messages.calendar.weekdays[(weekday + 6) % 7] ?? weekdayShort.format(date)),
      narrow: weekdayNarrow.format(date),
    };
  });

  // Emphasize the month in "October 2026" / "2026年10月" without hard-coding locale order.
  const titleParts = new Intl.DateTimeFormat(
    locale,
    view === 'days' ? { year: 'numeric', month: 'long' } : { year: 'numeric' },
  ).formatToParts(visible);
  const emphasized = view === 'days' ? 'month' : 'year';
  // Plain text nodes keep literal spaces in the accessible name of the title.
  const title = (
    <span className="leaf-calendar-view__title-text" aria-live="polite">
      {titleParts.map((part) =>
        part.type === emphasized ? <strong key="emphasis">{part.value}</strong> : part.value,
      )}
    </span>
  );
  const navigation = [-1, 1].map((sign) => (
    <button
      key={sign}
      type="button"
      className="leaf-calendar-view__nav"
      aria-label={
        view === 'days'
          ? sign < 0
            ? messages.calendar.previousMonth
            : messages.calendar.nextMonth
          : sign < 0
            ? messages.calendar.previousYear
            : messages.calendar.nextYear
      }
      disabled={!canNavigate(sign)}
      onClick={() => navigate(sign)}
    >
      {sign < 0 ? (
        <ChevronLeft size={16} aria-hidden="true" />
      ) : (
        <ChevronRight size={16} aria-hidden="true" />
      )}
    </button>
  ));
  const extra = hasContent(headerExtra) ? (
    <div className="leaf-calendar-view__extra">{headerExtra}</div>
  ) : null;
  const dayNumber = (date: Date) =>
    fullscreen && date.getDate() === 1
      ? monthDayFormat.formatToParts(date).map((part, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: Formatter parts have a stable order.
            key={index}
            className={part.type === 'day' ? undefined : 'leaf-calendar-view__number-month'}
          >
            {part.value}
          </span>
        ))
      : date.getDate();
  const miniMonth = (month: Date) => (
    <span className="leaf-calendar-view__mini" aria-hidden="true">
      {weekdays.map((weekday) => (
        <span key={`w${weekday.key}`} className="leaf-calendar-view__mini-weekday">
          {weekday.narrow}
        </span>
      ))}
      {calendarDays(month, weekStartsOn).map((date) => (
        <span
          key={dateKey(date)}
          className={classes(
            'leaf-calendar-view__mini-day',
            sameMonth(date, month) &&
              sameDate(date, today) &&
              'leaf-calendar-view__mini-day--today',
            sameMonth(date, month) &&
              mode === 'date' &&
              sameDate(date, selected) &&
              'leaf-calendar-view__mini-day--selected',
          )}
        >
          {sameMonth(date, month) ? date.getDate() : null}
        </span>
      ))}
    </span>
  );

  return (
    <section
      {...props}
      ref={root}
      aria-label={label ?? messages.calendar.label}
      data-view={view}
      className={classes(
        'leaf-calendar-view',
        fullscreen ? 'leaf-calendar-view--full' : 'leaf-calendar-view--compact',
        className,
      )}
    >
      <div className="leaf-calendar-view__header">
        <div className="leaf-calendar-view__heading">
          {!fullscreen && mode === 'date' ? (
            <button
              id={titleId}
              type="button"
              className="leaf-calendar-view__title leaf-calendar-view__title--toggle"
              aria-expanded={view === 'months'}
              onClick={() => setView(view === 'days' ? 'months' : 'days')}
            >
              {title}
              <ChevronRight
                className="leaf-calendar-view__title-icon"
                size={14}
                aria-hidden="true"
              />
            </button>
          ) : (
            <div id={titleId} className="leaf-calendar-view__title">
              {title}
            </div>
          )}
          {fullscreen && extra}
        </div>
        <div className="leaf-calendar-view__actions">
          {fullscreen && mode === 'date' && (
            <div className="leaf-calendar-view__segmented">
              {(['days', 'months'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className="leaf-calendar-view__segment"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                >
                  {option === 'days' ? messages.calendar.month : messages.calendar.year}
                </button>
              ))}
            </div>
          )}
          {fullscreen ? (
            <div className="leaf-calendar-view__nav-group">
              {navigation[0]}
              {showToday && (
                <button
                  type="button"
                  className="leaf-calendar-view__today"
                  disabled={!monthInRange(today)}
                  onClick={goToday}
                >
                  {messages.calendar.today}
                </button>
              )}
              {navigation[1]}
            </div>
          ) : (
            navigation
          )}
        </div>
      </div>
      {!fullscreen && extra}
      {/* biome-ignore-start lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: The CSS-grid ARIA date grid keeps focus on the roving day buttons inside each cell. */}
      {view === 'days' ? (
        <div role="grid" aria-labelledby={titleId} className="leaf-calendar-view__grid">
          <div role="row" className="leaf-calendar-view__weekdays">
            {weekdays.map((weekday) => (
              <span
                key={weekday.key}
                role="columnheader"
                aria-label={weekday.long}
                className="leaf-calendar-view__weekday"
              >
                <span className="leaf-calendar-view__weekday-short" aria-hidden="true">
                  {weekday.short}
                </span>
                <span className="leaf-calendar-view__weekday-narrow" aria-hidden="true">
                  {weekday.narrow}
                </span>
              </span>
            ))}
          </div>
          <div className="leaf-calendar-view__viewport">
            <div ref={body} role="rowgroup" className="leaf-calendar-view__rows">
              {weeks.map((week) => (
                <div role="row" key={dateKey(week[0] as Date)} className="leaf-calendar-view__week">
                  {week.map((date) => {
                    const key = dateKey(date);
                    const checked = sameDate(date, selected);
                    const isActive = sameDate(date, activeDay);
                    const content = cellRender?.(date);
                    const contentId = hasContent(content) ? `${uid}-${key}` : undefined;
                    return (
                      <div
                        key={key}
                        role="gridcell"
                        aria-selected={checked}
                        className="leaf-calendar-view__cell"
                      >
                        <button
                          type="button"
                          data-date={key}
                          data-active={isActive || undefined}
                          data-has-content={contentId ? true : undefined}
                          tabIndex={isActive ? 0 : -1}
                          aria-label={dayFormat.format(date)}
                          aria-current={sameDate(date, today) ? 'date' : undefined}
                          aria-describedby={contentId}
                          disabled={dayDisabled(date)}
                          className={classes(
                            'leaf-calendar-view__day',
                            !sameMonth(date, visible) && 'leaf-calendar-view__day--outside',
                          )}
                          onClick={() => chooseDay(date)}
                          onKeyDown={(event) => moveDay(date, event)}
                        >
                          <span className="leaf-calendar-view__number">{dayNumber(date)}</span>
                          {contentId && (
                            <span id={contentId} className="leaf-calendar-view__content">
                              {content}
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* biome-ignore-end lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: End of the ARIA date grid. */
        <div className="leaf-calendar-view__viewport">
          {/* biome-ignore lint/a11y/useSemanticElements: A fieldset would add form semantics to month navigation tiles. */}
          <div
            ref={body}
            role="group"
            aria-labelledby={titleId}
            className="leaf-calendar-view__months"
          >
            {months.map((month) => {
              const key = dateKey(month);
              const checked = mode === 'month' && sameMonth(month, selected);
              const isActive = sameMonth(month, activeMonth);
              const content = mode === 'month' ? cellRender?.(month) : undefined;
              const contentId = hasContent(content) ? `${uid}-${key}` : undefined;
              return (
                <button
                  key={key}
                  type="button"
                  data-date={key.slice(0, 7)}
                  data-active={isActive || undefined}
                  data-has-content={contentId ? true : undefined}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={monthFormat.format(month)}
                  aria-pressed={mode === 'month' ? checked : undefined}
                  aria-current={sameMonth(month, today) ? 'date' : undefined}
                  aria-describedby={contentId}
                  disabled={monthDisabled(month)}
                  className="leaf-calendar-view__month"
                  onClick={() => chooseMonth(month)}
                  onKeyDown={(event) => moveMonth(month, event)}
                >
                  <span className="leaf-calendar-view__month-name">
                    {monthNameFormat.format(month)}
                  </span>
                  {fullscreen && miniMonth(month)}
                  {contentId && (
                    <span id={contentId} className="leaf-calendar-view__content">
                      {content}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
