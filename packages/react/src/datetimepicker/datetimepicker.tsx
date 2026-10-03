import { forwardRef, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { CalendarPanel, dateTimeKey } from '../shared/calendar';
import { DateInput, type DateInputProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { displayTime } from '../shared/time';
import { TimePanel } from '../timepicker/time-panel';

export interface DateTimePickerProps
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
  value?: Date | null;
  defaultValue?: Date | null;
  minDate?: Date;
  maxDate?: Date;
  use12Hours?: boolean;
  showSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  onChange?: (value: Date | null, dateString: string) => void;
  onOpenChange?: (open: boolean) => void;
}
export const DateTimePicker = forwardRef<HTMLButtonElement, DateTimePickerProps>(
  function DateTimePicker(
    {
      value,
      defaultValue = null,
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
    const { locale, messages } = useLeafConfig();
    const field = useFormField();
    const trigger = useRef<HTMLButtonElement>(null);
    const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
    const merged = useMergedRef(trigger, ref);
    const [open, setOpen] = usePopupState(props.disabled ?? field?.disabled, onOpenChange);
    const [draft, setDraft] = useState(selected ?? new Date());
    const change = (next: Date | null) => {
      setSelected(next);
      onChange?.(next, next ? dateTimeKey(next) : '');
    };
    const valid = (!minDate || draft >= minDate) && (!maxDate || draft <= maxDate);
    const parts = {
      hour: draft.getHours(),
      minute: draft.getMinutes(),
      second: draft.getSeconds(),
    };
    const dateLabel = selected
      ? `${new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(selected)} ${displayTime({ hour: selected.getHours(), minute: selected.getMinutes(), second: selected.getSeconds() }, showSeconds, use12Hours, [messages.am, messages.pm])}`
      : '';
    return (
      <DateInput
        {...props}
        ref={merged}
        placeholder={props.placeholder ?? messages.dateTime}
        displayValue={dateLabel}
        formValue={selected ? dateTimeKey(selected) : ''}
        open={open}
        onOpenChange={setOpen}
        onOpening={() => {
          let next = new Date(selected ?? new Date());
          if (minDate && next < minDate) next = new Date(minDate);
          if (maxDate && next > maxDate) next = new Date(maxDate);
          if (!showSeconds) next.setSeconds(0, 0);
          setDraft(next);
        }}
        onClear={() => change(null)}
        panelClassName="leaf-datetime-panel"
        renderPanel={(close) => (
          <>
            <div className="leaf-datetime-panel__body">
              <CalendarPanel
                value={draft}
                picker="datetime"
                minDate={minDate}
                maxDate={maxDate}
                autoFocus={open}
                onChange={(date) => {
                  const next = new Date(date);
                  next.setHours(parts.hour, parts.minute, showSeconds ? parts.second : 0, 0);
                  setDraft(next);
                }}
              />
              <TimePanel
                value={parts}
                showSeconds={showSeconds}
                use12Hours={use12Hours}
                minuteStep={minuteStep}
                secondStep={secondStep}
                onChange={(time) => {
                  const next = new Date(draft);
                  next.setHours(time.hour, time.minute, showSeconds ? time.second : 0, 0);
                  setDraft(next);
                }}
              />
            </div>
            <div className="leaf-picker-footer">
              <span>{dateTimeKey(draft)}</span>
              <button
                type="button"
                disabled={!valid}
                onClick={() => {
                  if (valid) {
                    change(new Date(draft));
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
DateTimePicker.displayName = 'DateTimePicker';
