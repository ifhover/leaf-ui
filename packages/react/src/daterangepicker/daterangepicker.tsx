import { forwardRef, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
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
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { parseDateText } from '../shared/parse-date';
import { displayTime, type TimeParts } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';

export type DateRange = readonly [Date, Date];
export interface DateRangePickerProps extends PickerFieldProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  picker?: 'year' | 'month' | 'week' | 'date' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  use12Hours?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  onChange?: (value: DateRange | null, dateStrings: readonly [string, string]) => void;
  onOpenChange?: (open: boolean) => void;
}
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
      ...props
    },
    ref,
  ) {
    const { messages } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLInputElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(props.disabled ?? field?.disabled, onOpenChange);
    const [draft, setDraft] = useState<readonly [Date | null, Date | null]>(
      selected ?? [null, null],
    );
    const [endpoint, setEndpoint] = useState<0 | 1>(0);
    const [visible, setVisible] = useState(new Date(selected?.[0] ?? minDate ?? new Date()));
    const [hover, setHover] = useState<Date | null>(null);
    const [timeView, setTimeView] = useState<0 | 1 | null>(null);
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
    const label = (date: Date) =>
      picker === 'datetime'
        ? periodKey(date, 'date') +
          ' ' +
          displayTime(getTime(date), showSeconds, use12Hours, [messages.am, messages.pm])
        : canonical(date);
    const inBounds = (date: Date) => withinPeriod(date, picker, minDate, maxDate);
    const order = (a: Date, b: Date): DateRange =>
      a <= b ? [normalize(a), normalize(b)] : [normalize(b), normalize(a)];
    const change = (range: DateRange | null) => {
      setSelected(range);
      onChange?.(range, range ? [canonical(range[0]), canonical(range[1])] : ['', '']);
    };
    const parse = (text: string): DateRange | null => {
      const pieces = text.split(/\s*(?:~|～|–|—|至)\s*/);
      if (pieces.length !== 2) return null;
      const first = parseDateText(pieces[0]?.trim() ?? '', picker);
      const last = parseDateText(pieces[1]?.trim() ?? '', picker);
      if (!first || !last) return null;
      const range = order(first, last);
      return range.every(inBounds) ? range : null;
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
        setEndpoint(1);
      } else {
        const range = order(draft[0] ?? next, next);
        setDraft(range);
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
      if (updated[0] && updated[1] && updated.every((date) => date && inBounds(date))) {
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
        formValue={selected ? `${canonical(selected[0])}/${canonical(selected[1])}` : ''}
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
            selected ? getTime(selected[0]) : zero,
            selected ? getTime(selected[1]) : zero,
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
            setTimes([getTime(range[0]), getTime(range[1])]);
            setVisible(range[0]);
          }
        }}
        panelClassName="leaf-range-panel"
        renderPanel={(close) => (
          <>
            <div className="leaf-range-panel__endpoints">
              {([0, 1] as const).map((index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={endpoint === index}
                  onClick={() => {
                    if (index === 1 && !draft[0]) return;
                    setEndpoint(index);
                    setHover(null);
                  }}
                >
                  {index === 0 ? messages.start : messages.end}
                  <span>{draft[index] ? label(draft[index]) : '—'}</span>
                </button>
              ))}
            </div>
            <fieldset
              aria-label={messages.range}
              className="leaf-range-panel__calendars"
              onMouseLeave={() => setHover(null)}
            >
              {([0, 1] as const).map((index) => {
                const panelDate = index === 0 ? visible : shiftCalendar(visible, picker, 1);
                return (
                  <div key={index} className="leaf-range-panel__calendar">
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
                        autoFocus={focusCalendar === index}
                        value={draft[endpoint]}
                        picker={picker as CalendarMode}
                        minDate={minDate}
                        maxDate={maxDate}
                        visibleDate={panelDate}
                        onVisibleChange={(date) =>
                          setVisible(index === 0 ? date : shiftCalendar(date, picker, -1))
                        }
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
          </>
        )}
      />
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';
