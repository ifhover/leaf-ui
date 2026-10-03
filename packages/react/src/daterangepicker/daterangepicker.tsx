import { forwardRef, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import {
  type CalendarMode,
  CalendarPanel,
  periodKey,
  startOfPeriod,
  withinPeriod,
} from '../shared/calendar';
import { DateInput, type DateInputProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { TimePanel } from '../timepicker/time-panel';

export type DateRange = readonly [Date, Date];
export interface DateRangePickerProps
  extends Omit<
    DateInputProps,
    | 'displayValue'
    | 'formValue'
    | 'open'
    | 'onOpenChange'
    | 'onOpening'
    | 'onClear'
    | 'renderPanel'
    | 'panelClassName'
    | 'clearLabel'
  > {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  picker?: 'year' | 'month' | 'week' | 'weekday' | 'date' | 'datetime';
  minDate?: Date;
  maxDate?: Date;
  use12Hours?: boolean;
  minuteStep?: number;
  secondStep?: number;
  onChange?: (value: DateRange | null, dateStrings: readonly [string, string]) => void;
  onOpenChange?: (open: boolean) => void;
}
export const DateRangePicker = forwardRef<HTMLButtonElement, DateRangePickerProps>(
  function DateRangePicker(
    {
      value,
      defaultValue = null,
      picker = 'date',
      minDate,
      maxDate,
      use12Hours = false,
      minuteStep = 1,
      secondStep = 1,
      onChange,
      onOpenChange,
      ...props
    },
    ref,
  ) {
    const { locale, messages } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLButtonElement>(null);
    const merged = useMergedRef(trigger, ref);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const [open, setOpen] = usePopupState(props.disabled ?? field?.disabled, onOpenChange);
    const [draft, setDraft] = useState<readonly [Date | null, Date | null]>(
      selected ?? [null, null],
    );
    const [endpoint, setEndpoint] = useState<0 | 1>(0);
    const [active, setActive] = useState(new Date(selected?.[0] ?? minDate ?? new Date()));
    const normalize = (date: Date) => startOfPeriod(date, picker as CalendarMode);
    const change = (range: DateRange | null) => {
      setSelected(range);
      onChange?.(
        range,
        range ? [periodKey(range[0], picker), periodKey(range[1], picker)] : ['', ''],
      );
    };
    const order = (a: Date, b: Date): DateRange =>
      a <= b ? [new Date(a), new Date(b)] : [new Date(b), new Date(a)];
    const label = (date: Date) =>
      picker === 'weekday'
        ? `${periodKey(date, picker)} ${new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)}`
        : periodKey(date, picker);
    const activeDate = draft[endpoint] ?? active;
    const complete = Boolean(
      draft[0] &&
        draft[1] &&
        withinPeriod(draft[0], picker, minDate, maxDate) &&
        withinPeriod(draft[1], picker, minDate, maxDate),
    );
    const choose = (date: Date, close: () => void) => {
      const next = normalize(date);
      if (picker === 'datetime')
        next.setHours(activeDate.getHours(), activeDate.getMinutes(), activeDate.getSeconds(), 0);
      setActive(next);
      if (endpoint === 0) {
        setDraft([next, null]);
        setEndpoint(1);
      } else {
        const start = draft[0] ?? next;
        // Keep endpoint editing attached to the selected endpoint until confirmation.
        const range: DateRange = picker === 'datetime' ? [start, next] : order(start, next);
        setDraft(range);
        if (picker !== 'datetime') {
          change(range);
          close();
        }
      }
    };
    return (
      <DateInput
        {...props}
        ref={merged}
        className={['leaf-date-range-picker', props.className].filter(Boolean).join(' ')}
        placeholder={props.placeholder ?? messages.range}
        clearLabel={messages.clearRange}
        displayValue={selected ? `${label(selected[0])} – ${label(selected[1])}` : ''}
        formValue={
          selected ? `${periodKey(selected[0], picker)}/${periodKey(selected[1], picker)}` : ''
        }
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          setDraft(selected ?? [null, null]);
          setEndpoint(0);
          let date = new Date(selected?.[0] ?? minDate ?? new Date());
          if (maxDate && date > maxDate) date = new Date(maxDate);
          setActive(date);
        }}
        onClear={() => change(null)}
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
                    setEndpoint(index);
                    setActive(draft[index] ?? draft[0] ?? active);
                  }}
                >
                  {index === 0 ? messages.start : messages.end}
                  <span>{draft[index] ? label(draft[index]) : '—'}</span>
                </button>
              ))}
            </div>
            <div className={picker === 'datetime' ? 'leaf-datetime-panel__body' : undefined}>
              <CalendarPanel
                key={picker}
                value={activeDate}
                picker={picker}
                minDate={minDate}
                maxDate={maxDate}
                range={draft}
                autoFocus={open}
                onChange={(date) => choose(date, close)}
              />
              {picker === 'datetime' && (
                <TimePanel
                  value={{
                    hour: activeDate.getHours(),
                    minute: activeDate.getMinutes(),
                    second: activeDate.getSeconds(),
                  }}
                  showSeconds
                  use12Hours={use12Hours}
                  minuteStep={minuteStep}
                  secondStep={secondStep}
                  onChange={(time) => {
                    const next = new Date(activeDate);
                    next.setHours(time.hour, time.minute, time.second, 0);
                    setActive(next);
                    setDraft((current) =>
                      endpoint === 0 ? [next, current[1]] : [current[0], next],
                    );
                  }}
                />
              )}
            </div>
            <div className="leaf-picker-footer">
              <span>{endpoint === 0 ? messages.start : messages.end}</span>
              <button
                type="button"
                disabled={!complete}
                onClick={() => {
                  if (complete && draft[0] && draft[1]) {
                    change(order(draft[0], draft[1]));
                    close();
                  }
                }}
              >
                {messages.confirm}
              </button>
            </div>
          </>
        )}
      />
    );
  },
);
DateRangePicker.displayName = 'DateRangePicker';
