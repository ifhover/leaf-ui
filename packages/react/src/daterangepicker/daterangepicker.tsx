import { forwardRef, type ReactNode, useRef, useState } from 'react';
import { Button } from '../button';
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
import { useContentTransition } from '../shared/presence';
import { displayTime, type TimeParts } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';

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
export type DateRangePickerProps = DateRangePickerBaseProps &
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
export const DateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue = null,
      picker = 'date',
      minDate,
      maxDate,
      use12Hours = false,
      showSeconds = true,
      minuteStep = 1,
      secondStep = 1,
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
    },
    ref,
  ) {
    const { messages } = useLeafConfig();
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
    const [draft, setDraft] = useState<readonly [Date | null, Date | null]>(
      selected ?? [null, null],
    );
    const [endpoint, setEndpoint] = useState<0 | 1>(0);
    const [visible, setVisible] = useState(new Date(selected?.[0] ?? minDate ?? new Date()));
    const [hover, setHover] = useState<Date | null>(null);
    const [timeView, setTimeView] = useState<0 | 1 | null>(null);
    const firstPanel = useRef<HTMLDivElement>(null);
    const secondPanel = useRef<HTMLDivElement>(null);
    useContentTransition(firstPanel, `${open}:${timeView === 0}`, timeView === 0 ? 1 : -1);
    useContentTransition(secondPanel, `${open}:${timeView === 1}`, timeView === 1 ? 1 : -1);
    const [focusCalendar, setFocusCalendar] = useState<0 | 1 | null>(null);
    const [times, setTimes] = useState<readonly [TimeParts, TimeParts]>([
      getTime(selected?.[0] ?? new Date(new Date().setHours(0, 0, 0, 0))),
      getTime(selected?.[1] ?? new Date(new Date().setHours(0, 0, 0, 0))),
    ]);
    const normalize = (date: Date) => {
      const next = startOfPeriod(date, picker);
      if (picker === 'datetime' && !showSeconds) next.setSeconds(0);
      return next;
    };
    const canonical = (date: Date) =>
      picker === 'datetime' ? dateTimeKey(date, showSeconds) : periodKey(date, picker);
    const timeLabel = (index: 0 | 1) =>
      displayTime(times[index], showSeconds, use12Hours, [messages.am, messages.pm]);
    const defaultLabel = (date: Date) =>
      picker === 'datetime'
        ? periodKey(date, 'date') +
          ' ' +
          displayTime(getTime(date), showSeconds, use12Hours, [messages.am, messages.pm])
        : canonical(date);
    const label = (date: Date | null) => (date ? formatPickerDate(date, format, defaultLabel) : '');
    const inBounds = (date: Date, position: 0 | 1 = endpoint) =>
      withinPeriod(date, picker, minDate, maxDate) &&
      !disabledDate?.(date, position === 0 ? 'start' : 'end') &&
      !(
        picker === 'datetime' &&
        disabledTime?.(getTime(date), position === 0 ? 'start' : 'end', date)
      );
    const order = (a: Date, b: Date): DateRange =>
      a <= b ? [normalize(a), normalize(b)] : [normalize(b), normalize(a)];
    const change = (range: OpenDateRange | null) => {
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
    const parse = (text: string): OpenDateRange | null => {
      const pieces = text.split(/\s*(?:~|～|–|—|至)\s*/);
      if (pieces.length !== 2) return null;
      const first = parsePickerDate(
        pieces[0]?.trim() ?? '',
        format,
        (text) => parseDateText(text, picker),
        customParse,
      );
      const last = parsePickerDate(
        pieces[1]?.trim() ?? '',
        format,
        (text) => parseDateText(text, picker),
        customParse,
      );
      if (
        (!first && (pieces[0]?.trim() || !emptyAllowed[0])) ||
        (!last && (pieces[1]?.trim() || !emptyAllowed[1])) ||
        (!first && !last)
      )
        return null;
      const range: OpenDateRange = first && last ? order(first, last) : [first, last];
      return range.every((date, index) => !date || inBounds(date, index as 0 | 1)) ? range : null;
    };
    const choose = (date: Date, close: () => void) => {
      let next = normalize(date);
      if (picker === 'datetime') {
        const time = times[endpoint];
        next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
        if (minDate && next < minDate) next = new Date(minDate);
        if (maxDate && next > maxDate) next = new Date(maxDate);
        next = normalize(next);
      }
      if (!inBounds(next)) return;
      setHover(null);
      if (endpoint === 0) {
        setDraft([next, null]);
        onCalendarChange?.([next, null], { position: 'start' });
        if (emptyAllowed[1]) change([next, null]);
        setEndpoint(1);
      } else {
        const range: OpenDateRange =
          !draft[0] && emptyAllowed[0] ? [null, next] : order(draft[0] ?? next, next);
        if (range.some((date, index) => date && !inBounds(date, index as 0 | 1))) return;
        setDraft(range);
        onCalendarChange?.(range, { position: 'end' });
        change(range);
        close();
      }
    };
    const updateTime = (index: 0 | 1, time: TimeParts) => {
      setTimes((current) => (index === 0 ? [time, current[1]] : [current[0], time]));
      const existing = draft[index];
      if (!existing) return;
      const next = new Date(existing);
      next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
      const updated = index === 0 ? ([next, draft[1]] as const) : ([draft[0], next] as const);
      setDraft(updated);
      onCalendarChange?.(updated, { position: index === 0 ? 'start' : 'end' });
      if (
        updated[0] &&
        updated[1] &&
        updated.every((date, index) => date && inBounds(date, index as 0 | 1))
      ) {
        change(order(updated[0], updated[1]));
      }
    };
    return (
      <DateInput
        {...props}
        ref={merged}
        className={['leaf-date-range-picker', props.className].filter(Boolean).join(' ')}
        placeholder={props.placeholder ?? messages.range}
        clearLabel={messages.clearRange}
        displayValue={selected ? `${label(selected[0])} ~ ${label(selected[1])}` : ''}
        formValue={
          selected
            ? `${selected[0] ? canonical(selected[0]) : ''}/${selected[1] ? canonical(selected[1]) : ''}`
            : ''
        }
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          setDraft(selected ?? [null, null]);
          setEndpoint(0);
          setHover(null);
          setTimeView(null);
          setFocusCalendar(null);
          let date = new Date(selected?.[0] ?? minDate ?? new Date());
          if (maxDate && date > maxDate) date = new Date(maxDate);
          setVisible(date);
          const zero = { hour: 0, minute: 0, second: 0 };
          setTimes([
            selected?.[0] ? getTime(selected[0]) : zero,
            selected?.[1] ? getTime(selected[1]) : zero,
          ]);
        }}
        onClear={() => change(null)}
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
          const range = parse(text.trim());
          if (range) {
            setDraft(range);
            setTimes([
              range[0] ? getTime(range[0]) : times[0],
              range[1] ? getTime(range[1]) : times[1],
            ]);
            const first = range[0] ?? range[1];
            if (first) setVisible(first);
          }
        }}
        panelClassName="leaf-range-panel"
        renderPanel={(close) => (
          <>
            <fieldset
              aria-label={messages.range}
              className="leaf-range-panel__calendars"
              onMouseLeave={() => setHover(null)}
            >
              {([0, 1] as const).map((index) => {
                const base = panelValue ?? visible;
                const panelDate = index === 0 ? base : shiftCalendar(base, picker, 1);
                return (
                  <div
                    key={index}
                    ref={index === 0 ? firstPanel : secondPanel}
                    className="leaf-range-panel__calendar"
                  >
                    {timeView === index && picker === 'datetime' ? (
                      <div className="leaf-picker-time-view">
                        <div className="leaf-picker-time-view__header">
                          <button
                            type="button"
                            className="leaf-picker-time-toggle"
                            aria-label={messages.selectDate}
                            onClick={() => {
                              setFocusCalendar(index);
                              setTimeView(null);
                            }}
                          >
                            {messages.selectDate}
                          </button>
                          <span>{timeLabel(index)}</span>
                        </div>
                        <TimePanel
                          disabledTime={(parts) =>
                            !!disabledTime?.(
                              parts,
                              index === 0 ? 'start' : 'end',
                              draft[index] ?? panelDate,
                            )
                          }
                          autoFocus
                          value={times[index]}
                          showSeconds={showSeconds}
                          use12Hours={use12Hours}
                          minuteStep={minuteStep}
                          secondStep={secondStep}
                          onChange={(time) => updateTime(index, time)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTime(index, getTime(new Date()))}
                        >
                          {messages.now}
                        </Button>
                      </div>
                    ) : (
                      <CalendarPanel
                        cellRender={cellRender}
                        disabledDate={(date) =>
                          !!disabledDate?.(date, endpoint === 0 ? 'start' : 'end')
                        }
                        autoFocus={focusCalendar === index}
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
                        range={draft}
                        hoverDate={hover}
                        onHover={(date) => {
                          if (endpoint === 1 && draft[0] && !draft[1]) setHover(date);
                        }}
                        showOutsideDays={false}
                        onChange={(date) => choose(date, close)}
                        headerExtra={
                          picker === 'datetime' ? (
                            <button
                              type="button"
                              className="leaf-picker-time-toggle"
                              aria-label={
                                (index === 0 ? messages.start : messages.end) +
                                ' ' +
                                messages.selectTime
                              }
                              onClick={() => {
                                setFocusCalendar(null);
                                setTimeView(index);
                              }}
                            >
                              {timeLabel(index)}
                            </button>
                          ) : undefined
                        }
                      />
                    )}
                  </div>
                );
              })}
            </fieldset>
            {(presets?.length || allowEmpty) && (
              <div className="leaf-picker-presets">
                {presets?.map((preset, index) => (
                  <Button
                    // biome-ignore lint/suspicious/noArrayIndexKey: Presets retain their declared order and do not contain local state.
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const range =
                        typeof preset.value === 'function' ? preset.value() : preset.value;
                      change(range);
                      if (
                        range.every((date, index) =>
                          date ? inBounds(date, index as 0 | 1) : emptyAllowed[index],
                        )
                      )
                        close();
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
                {([0, 1] as const).map(
                  (index) =>
                    emptyAllowed[index] && (
                      <Button
                        key={`empty-${index}`}
                        size="sm"
                        variant="ghost"
                        disabled={!draft[1 - index]}
                        onClick={() => {
                          const next: OpenDateRange =
                            index === 0 ? [null, draft[1]] : [draft[0], null];
                          setDraft(next);
                          onCalendarChange?.(next, { position: index === 0 ? 'start' : 'end' });
                          change(next);
                          close();
                        }}
                      >
                        {messages.clearSelection} {index === 0 ? messages.start : messages.end}
                      </Button>
                    ),
                )}
              </div>
            )}
          </>
        )}
      />
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';
