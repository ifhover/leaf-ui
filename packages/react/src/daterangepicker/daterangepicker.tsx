import { forwardRef, type ReactNode, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import {
  type CalendarMode,
  CalendarPanel,
  dateTimeKey,
  periodKey,
  shiftCalendar,
  startOfPeriod,
  withinPeriod,
} from '../shared/calendar';
import { classes } from '../shared/classes';
import {
  type DateFormat,
  type DatePreset,
  formatPickerDate,
  parsePickerDate,
} from '../shared/date-format';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';
import { pickerSegments } from '../shared/segments';
import { displayTime, parseTime, type TimeParts } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';
import { TimeRangeInput, type TimeRangePickerModeProps } from '../timerangepicker/timerangepicker';

export type DateRange = readonly [Date, Date];
export type OpenDateRange = readonly [Date | null, Date | null];
interface DateRangePickerBaseProps extends PickerFieldProps {
  picker?: 'year' | 'quarter' | 'month' | 'week' | 'date' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  use12Hours?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  /** Times applied to newly picked start and end dates in `datetime` mode. */
  defaultTime?: readonly [string, string];
  /** Require OK or Enter to commit; dismissing otherwise discards the draft. */
  needConfirm?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabledDate?: (date: Date, position: 'start' | 'end') => boolean;
  disabledTime?: (parts: TimeParts, position: 'start' | 'end', date: Date) => boolean;
  format?: DateFormat;
  parse?: (text: string) => Date | null;
  presets?: readonly DatePreset<OpenDateRange>[];
  onCalendarChange?: (range: OpenDateRange, info: { position: 'start' | 'end' }) => void;
  panelValue?: Date;
  onPanelChange?: (date: Date) => void;
  cellRender?: (date: Date) => ReactNode;
}
export type CalendarDateRangePickerProps = DateRangePickerBaseProps &
  (
    | {
        allowEmpty?: false;
        value?: DateRange | null;
        defaultValue?: DateRange | null;
        onChange?: (value: DateRange | null, dateStrings: readonly [string, string]) => void;
      }
    | {
        allowEmpty: true | readonly [boolean, boolean];
        value?: OpenDateRange | null;
        defaultValue?: OpenDateRange | null;
        onChange?: (value: OpenDateRange | null, dateStrings: readonly [string, string]) => void;
      }
  );
const getTime = (date: Date): TimeParts => ({
  hour: date.getHours(),
  minute: date.getMinutes(),
  second: date.getSeconds(),
});
const midnight: TimeParts = { hour: 0, minute: 0, second: 0 };
const defaultTimes = ['00:00:00', '23:59:59'] as const;
const CalendarDateRangePicker = forwardRef<HTMLInputElement, CalendarDateRangePickerProps>(
  function CalendarDateRangePicker(rawProps: CalendarDateRangePickerProps, ref) {
    const {
      value,
      defaultValue = null,
      picker = 'date',
      minDate,
      maxDate,
      use12Hours = false,
      showSeconds = false,
      minuteStep = 1,
      secondStep = 1,
      defaultTime = defaultTimes,
      needConfirm = picker === 'datetime',
      onChange,
      onOpenChange,
      open: controlledOpen,
      defaultOpen,
      allowEmpty = false,
      disabledDate,
      disabledTime,
      format,
      parse: customParse,
      presets,
      onCalendarChange,
      panelValue,
      onPanelChange,
      cellRender,
      ...props
    } = rawProps;
    const { messages, weekStartsOn } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue<OpenDateRange | null>(
      value,
      defaultValue,
      trigger,
      props.form,
    );
    const [open, setOpen] = usePopupState(
      props.disabled || field?.disabled || props.readOnly,
      onOpenChange,
      controlledOpen,
      defaultOpen,
    );
    const emptyAllowed = typeof allowEmpty === 'boolean' ? [allowEmpty, allowEmpty] : allowEmpty;
    const datetime = picker === 'datetime';
    const periods = [messages.timePicker.am, messages.timePicker.pm] as const;
    const [draft, setDraft] = useState<OpenDateRange>(selected ?? [null, null]);
    const [fieldDraft, setFieldDraft] = useState<OpenDateRange | null>(null);
    const [validText, setValidText] = useState(true);
    const [endpoint, setEndpoint] = useState<0 | 1>(0);
    const [visible, setVisible] = useState(new Date(selected?.[0] ?? minDate ?? new Date()));
    const [hover, setHover] = useState<Date | null>(null);
    const [preview, setPreview] = useState<OpenDateRange | null>(null);
    const [times, setTimes] = useState<readonly [TimeParts, TimeParts]>([midnight, midnight]);
    // Endpoints picked since opening decide when a click completes the range, and only a
    // changed draft is committed when the popup is dismissed.
    const picked = useRef(new Set<0 | 1>());
    const touched = useRef(false);
    const normalize = (date: Date) => {
      const next = startOfPeriod(date, picker, weekStartsOn);
      if (datetime && !showSeconds) next.setSeconds(0);
      return next;
    };
    const canonical = (date: Date) =>
      datetime ? dateTimeKey(date, showSeconds) : periodKey(date, picker, weekStartsOn);
    const defaultLabel = (date: Date) =>
      datetime
        ? `${periodKey(date, 'date')} ${displayTime(getTime(date), showSeconds, use12Hours, periods)}`
        : canonical(date);
    const label = (date: Date | null) => (date ? formatPickerDate(date, format, defaultLabel) : '');
    const position = (index: 0 | 1) => (index === 0 ? 'start' : 'end');
    const inBounds = (date: Date, index: 0 | 1 = endpoint) =>
      (datetime
        ? (!minDate || date >= minDate) && (!maxDate || date <= maxDate)
        : withinPeriod(date, picker, minDate, maxDate, weekStartsOn)) &&
      !disabledDate?.(date, position(index)) &&
      !(datetime && disabledTime?.(getTime(date), position(index), date));
    const order = (a: Date, b: Date): DateRange =>
      a <= b ? [normalize(a), normalize(b)] : [normalize(b), normalize(a)];
    const ordered = (range: OpenDateRange): OpenDateRange =>
      range[0] && range[1] ? order(range[0], range[1]) : range;
    const committable = (range: OpenDateRange) =>
      validText &&
      range.some(Boolean) &&
      (!range[0] || !range[1] || range[0] <= range[1]) &&
      range.every((date, index) => (date ? inBounds(date, index as 0 | 1) : emptyAllowed[index]));
    const change = (range: OpenDateRange | null) => {
      if (!range && !selected) return;
      if (
        props.readOnly ||
        props.disabled ||
        field?.disabled ||
        (range &&
          (!range.some(Boolean) ||
            range.some((date, index) =>
              date ? !inBounds(date, index as 0 | 1) : !emptyAllowed[index],
            )))
      )
        return;
      setSelected(range);
      (
        onChange as
          | ((value: OpenDateRange | null, strings: readonly [string, string]) => void)
          | undefined
      )?.(
        range,
        range
          ? [
              range[0] ? formatPickerDate(range[0], format, canonical) : '',
              range[1] ? formatPickerDate(range[1], format, canonical) : '',
            ]
          : ['', ''],
      );
    };
    const parsePiece = (text: string) => {
      const date = parsePickerDate(
        text,
        format,
        (text) => parseDateText(text, picker, periods, weekStartsOn),
        customParse,
      );
      return date ? normalize(date) : null;
    };
    const parse = (text: string): OpenDateRange | null => {
      const pieces = text.split(/\s*(?:~|～|–|—|至)\s*/);
      if (pieces.length !== 2) return null;
      const first = parsePiece(pieces[0]?.trim() ?? '');
      const last = parsePiece(pieces[1]?.trim() ?? '');
      if (
        (!first && (pieces[0]?.trim() || !emptyAllowed[0])) ||
        (!last && (pieces[1]?.trim() || !emptyAllowed[1])) ||
        (!first && !last)
      )
        return null;
      const range: OpenDateRange = first && last ? order(first, last) : [first, last];
      return range.every((date, index) => !date || inBounds(date, index as 0 | 1)) ? range : null;
    };
    const update = (range: OpenDateRange, index: 0 | 1) => {
      touched.current = true;
      setValidText(true);
      setDraft(range);
      setFieldDraft(range);
      onCalendarChange?.(range, { position: position(index) });
    };
    const switchEndpoint = (index: 0 | 1) => {
      setEndpoint(index);
      setHover(null);
      const date = draft[index];
      if (datetime && date) setVisible(date);
    };
    const choose = (
      date: Date,
      close: (focusSegment?: 'hour' | 'hour12', group?: number) => void,
    ) => {
      let next = normalize(date);
      if (datetime) {
        const time = draft[endpoint] ? getTime(draft[endpoint]) : times[endpoint];
        next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
        if (minDate && next < minDate) next = new Date(minDate);
        if (maxDate && next > maxDate) next = new Date(maxDate);
        next = normalize(next);
      }
      if (
        !withinPeriod(next, datetime ? 'date' : picker, minDate, maxDate, weekStartsOn) ||
        disabledDate?.(next, position(endpoint))
      )
        return;
      setHover(null);
      const other = draft[endpoint === 0 ? 1 : 0];
      if (datetime && endpoint === 1 && other && periodKey(next, 'date') < periodKey(other, 'date'))
        return;
      // Calendar ranges can reverse; datetime endpoints retain their explicit positions.
      const range: OpenDateRange =
        endpoint === 0
          ? [next, other && next > other ? null : other]
          : other
            ? !datetime && next < other
              ? order(other, next)
              : [other, next]
            : [null, next];
      if (!datetime && range.some((date, index) => date && !inBounds(date, index as 0 | 1))) return;
      picked.current.add(endpoint);
      update(range, endpoint);
      const finishing = endpoint === 1 || picked.current.has(1);
      if (!datetime && !needConfirm && finishing && committable(range) && range[1]) {
        change(range);
        close(datetime ? (use12Hours ? 'hour12' : 'hour') : undefined);
        return;
      }
      if (!datetime && endpoint === 0) switchEndpoint(1);
      else if (endpoint === 1 && !range[0] && !emptyAllowed[0]) switchEndpoint(0);
    };
    const presetValue = (preset: DatePreset<OpenDateRange>) =>
      typeof preset.value === 'function' ? preset.value() : preset.value;
    const rangeKey = (range: OpenDateRange) =>
      range.map((date) => (date ? canonical(date) : '')).join('/');
    const confirm = datetime || needConfirm;
    const clearButtons = ([0, 1] as const).filter((index) => emptyAllowed[index]);
    const displayed = open && fieldDraft ? fieldDraft : selected;
    return (
      <DateInput
        {...props}
        ref={merged}
        segments={pickerSegments(
          picker,
          format,
          displayed ?? [null, null],
          showSeconds,
          use12Hours,
          minuteStep,
          secondStep,
        )}
        className={classes(
          'leaf-date-range-picker',
          datetime && 'leaf-date-range-picker--datetime',
          datetime && (showSeconds || use12Hours) && 'leaf-date-range-picker--extended',
          props.className,
        )}
        placeholder={props.placeholder ?? messages.dateRangePicker.placeholder}
        clearLabel={messages.dateRangePicker.clear}
        commitOnBlur={!needConfirm}
        onSegmentChange={(group) => {
          if (open && group !== endpoint) switchEndpoint(group as 0 | 1);
        }}
        onPanelConfirm={() => {
          if (datetime && endpoint === 0 && validText && draft[0] && inBounds(draft[0], 0)) {
            switchEndpoint(1);
            return false;
          }
          if (!committable(draft)) return false;
          change(ordered(draft));
          return true;
        }}
        displayValue={displayed ? `${label(displayed[0])} ~ ${label(displayed[1])}` : ''}
        formValue={
          selected
            ? `${selected[0] ? canonical(selected[0]) : ''}/${selected[1] ? canonical(selected[1]) : ''}`
            : ''
        }
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          const current = selected ?? [null, null];
          setFieldDraft(null);
          setDraft(current);
          // Continue with the missing end when only the start is set.
          setEndpoint(current[0] && !current[1] ? 1 : 0);
          setHover(null);
          setPreview(null);
          picked.current = new Set();
          touched.current = false;
          setValidText(true);
          let date = new Date(current[0] ?? current[1] ?? minDate ?? new Date());
          if (maxDate && date > maxDate) date = new Date(maxDate);
          setVisible(date);
          setTimes([
            current[0] ? getTime(current[0]) : (parseTime(defaultTime[0]) ?? midnight),
            current[1] ? getTime(current[1]) : (parseTime(defaultTime[1]) ?? midnight),
          ]);
        }}
        onDismiss={() => {
          if (touched.current && !needConfirm && committable(draft)) change(ordered(draft));
        }}
        onClear={() => {
          change(null);
          setDraft([null, null]);
          setFieldDraft(null);
          setValidText(true);
          touched.current = false;
        }}
        onTextCommit={(text) => {
          if (!text) {
            change(null);
            return true;
          }
          const range = parse(text);
          if (!range) return false;
          change(range);
          return true;
        }}
        onTextChange={(text) => {
          const pieces = text.trim().split(/\s*(?:~|～|–|—|至)\s*/);
          setValidText(
            pieces.length === 2 &&
              pieces.every((piece) => !piece.trim() || Boolean(parsePiece(piece))),
          );
          const range = pieces.map((piece) => parsePiece(piece)) as unknown as OpenDateRange;
          if (pieces.length !== 2) return;
          setDraft(range);
          const activeDate = range[endpoint];
          if (activeDate) {
            setVisible(activeDate);
            setTimes([
              range[0] ? getTime(range[0]) : times[0],
              range[1] ? getTime(range[1]) : times[1],
            ]);
          }
        }}
        panelClassName={classes('leaf-range-panel', datetime && 'leaf-range-panel--datetime')}
        renderPanel={(close) => (
          <>
            <fieldset
              className="leaf-range-panel__endpoints"
              data-active={endpoint}
              aria-label={messages.dateRangePicker.placeholder}
            >
              {([0, 1] as const).map((index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={endpoint === index}
                  onClick={() => switchEndpoint(index)}
                >
                  <span className="leaf-range-panel__endpoint-label">
                    {index === 0 ? messages.common.start : messages.common.end}
                  </span>{' '}
                </button>
              ))}
            </fieldset>
            <div
              className={classes(
                'leaf-range-panel__body',
                Boolean(presets?.length) && 'leaf-range-panel__body--presets',
              )}
            >
              {presets?.length ? (
                <fieldset
                  aria-label={messages.datePicker.presets}
                  className="leaf-picker-presets leaf-picker-presets--side"
                  onMouseLeave={() => setPreview(null)}
                >
                  {presets.map((preset, index) => (
                    <ButtonControl
                      key={preset.key ?? index}
                      variant="text"
                      size="sm"
                      aria-pressed={rangeKey(presetValue(preset)) === rangeKey(draft)}
                      onMouseEnter={() => setPreview(presetValue(preset))}
                      onFocus={() => setPreview(presetValue(preset))}
                      onBlur={() => setPreview(null)}
                      onClick={() => {
                        const range = presetValue(preset);
                        setPreview(null);
                        change(range);
                        if (committable(range)) close();
                      }}
                    >
                      {preset.label}
                    </ButtonControl>
                  ))}
                </fieldset>
              ) : null}
              <fieldset
                aria-label={messages.dateRangePicker.placeholder}
                className={classes(
                  'leaf-range-panel__calendars',
                  datetime && 'leaf-range-panel__calendars--datetime',
                )}
                onMouseLeave={() => setHover(null)}
              >
                {(datetime ? ([0] as const) : ([0, 1] as const)).map((index) => {
                  const base = panelValue ?? visible;
                  const panelDate = index === 0 ? base : shiftCalendar(base, picker, 1);
                  return (
                    <div key={index} className="leaf-range-panel__calendar">
                      <CalendarPanel
                        cellRender={cellRender}
                        disabledDate={(date) =>
                          !!disabledDate?.(date, position(endpoint)) ||
                          Boolean(
                            datetime &&
                              endpoint === 1 &&
                              draft[0] &&
                              periodKey(date, 'date') < periodKey(draft[0], 'date'),
                          )
                        }
                        value={draft[endpoint]}
                        picker={picker as CalendarMode}
                        minDate={minDate}
                        maxDate={maxDate}
                        visibleDate={panelDate}
                        onVisibleChange={(date) => {
                          const next = index === 0 ? date : shiftCalendar(date, picker, -1);
                          setVisible(next);
                          onPanelChange?.(next);
                        }}
                        range={preview ?? draft}
                        hoverDate={preview ? null : hover}
                        onHover={(date) => {
                          if (endpoint === 1 && draft[0] && !draft[1]) setHover(date);
                        }}
                        showOutsideDays={datetime}
                        onChange={(date) => choose(date, close)}
                      />
                    </div>
                  );
                })}
                {datetime && (
                  <div className="leaf-range-panel__time">
                    <TimePanel
                      value={draft[endpoint] ? getTime(draft[endpoint]) : times[endpoint]}
                      showSeconds={showSeconds}
                      use12Hours={use12Hours}
                      minuteStep={minuteStep}
                      secondStep={secondStep}
                      disabledTime={(parts) => {
                        const next = new Date(draft[endpoint] ?? visible);
                        next.setHours(parts.hour, parts.minute, parts.second, 0);
                        return (
                          !inBounds(next) || Boolean(endpoint === 1 && draft[0] && next < draft[0])
                        );
                      }}
                      onChange={(parts) => {
                        const next = new Date(draft[endpoint] ?? visible);
                        next.setHours(parts.hour, parts.minute, parts.second, 0);
                        setTimes((previous) =>
                          endpoint === 0 ? [parts, previous[1]] : [previous[0], parts],
                        );
                        update(
                          endpoint === 0
                            ? [next, draft[1] && next <= draft[1] ? draft[1] : null]
                            : [draft[0], next],
                          endpoint,
                        );
                      }}
                    />
                  </div>
                )}
              </fieldset>
            </div>
            {(confirm || clearButtons.length > 0) && (
              <div className="leaf-picker-footer">
                <div className="leaf-picker-footer__extra">
                  {clearButtons.map((index) => (
                    <ButtonControl
                      key={`empty-${index}`}
                      size="sm"
                      variant="outline"
                      disabled={!draft[index === 0 ? 1 : 0]}
                      onClick={() => {
                        const next: OpenDateRange =
                          index === 0 ? [null, draft[1]] : [draft[0], null];
                        update(next, index);
                        change(next);
                        close();
                      }}
                    >
                      {messages.select.clear}{' '}
                      {index === 0 ? messages.common.start : messages.common.end}
                    </ButtonControl>
                  ))}
                </div>
                {confirm && (
                  <ButtonControl
                    size="sm"
                    variant="solid"
                    disabled={
                      datetime && endpoint === 0
                        ? !validText || !draft[0] || !inBounds(draft[0], 0)
                        : !committable(draft)
                    }
                    onClick={() => {
                      if (datetime && endpoint === 0) {
                        switchEndpoint(1);
                        return;
                      }
                      change(ordered(draft));
                      close();
                    }}
                  >
                    {datetime && endpoint === 0 ? messages.common.next : messages.common.confirm}
                  </ButtonControl>
                )}
              </div>
            )}
          </>
        )}
      />
    );
  },
);
export type DateRangePickerProps = CalendarDateRangePickerProps | TimeRangePickerModeProps;
export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  function DateRangePicker(rawProps, ref) {
    const props = useComponentProps('DateRangePicker', rawProps);
    return props.picker === 'time' ? (
      <TimeRangeInput {...props} ref={ref} />
    ) : (
      <CalendarDateRangePicker {...props} ref={ref} />
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';
