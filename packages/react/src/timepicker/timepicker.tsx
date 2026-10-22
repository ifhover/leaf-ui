import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { displayTime, parseTime, type TimeParts, timeString } from '../shared/time';
import { TimePanel } from './time-panel';

export interface TimePickerProps extends PickerFieldProps {
  value?: string | null;
  defaultValue?: string | null;
  minuteStep?: number;
  secondStep?: number;
  showSeconds?: boolean;
  use12Hours?: boolean;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
  disabledTime?: (parts: TimeParts) => boolean;
}
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  rawProps: TimePickerProps,
  ref,
) {
  const {
    value,
    defaultValue = null,
    minuteStep = 5,
    secondStep = 1,
    showSeconds = false,
    use12Hours = false,
    onChange,
    onOpenChange,
    disabledTime,
    open: controlledOpen,
    defaultOpen,
    ...props
  } = useComponentProps('TimePicker', rawProps);
  const { messages } = useLeafConfig();
  const field = useFormField();
  const trigger = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(trigger, ref);
  const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
  const [draft, setDraft] = useState<TimeParts>(
    parseTime(selected) ?? { hour: 9, minute: 0, second: 0 },
  );
  const [validText, setValidText] = useState(true);
  const [open, setOpen] = usePopupState(
    props.disabled || field?.disabled || props.readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const change = (parts: TimeParts | null) => {
    if (props.readOnly || props.disabled || field?.disabled || (parts && disabledTime?.(parts)))
      return;
    const next = parts ? timeString(parts, showSeconds) : null;
    setSelected(next);
    onChange?.(next);
  };
  const formatted = (parts: TimeParts) =>
    displayTime(parts, showSeconds, use12Hours, [messages.timePicker.am, messages.timePicker.pm]);
  const parsed = parseTime(selected);
  return (
    <DateInput
      {...props}
      ref={merged}
      className={['leaf-time-picker', props.className].filter(Boolean).join(' ')}
      placeholder={props.placeholder ?? messages.timePicker.placeholder}
      icon={<Clock3 size={16} aria-hidden="true" />}
      panelLabel={messages.timePicker.label}
      clearLabel={messages.timePicker.clear}
      commitOnBlur={false}
      displayValue={parsed ? formatted(parsed) : ''}
      formValue={parsed ? timeString(parsed, showSeconds) : ''}
      open={open}
      onOpenChange={setOpen}
      onOpening={() => {
        setDraft(parseTime(selected) ?? { hour: 9, minute: 0, second: 0 });
        setValidText(true);
      }}
      onClear={() => change(null)}
      onTextChange={(text) => {
        const next = parseTime(text.trim(), [messages.timePicker.am, messages.timePicker.pm]);
        setValidText(Boolean(next));
        if (next) setDraft(next);
      }}
      onTextCommit={(text) => {
        if (!text) {
          change(null);
          return true;
        }
        const next = parseTime(text, [messages.timePicker.am, messages.timePicker.pm]);
        if (!next || disabledTime?.(next)) return false;
        change(next);
        return true;
      }}
      panelClassName="leaf-time-picker__panel"
      renderPanel={(close) => (
        <>
          <TimePanel
            disabledTime={disabledTime}
            value={draft}
            onChange={(next) => {
              setDraft(next);
              setValidText(true);
            }}
            minuteStep={minuteStep}
            secondStep={secondStep}
            showSeconds={showSeconds}
            use12Hours={use12Hours}
          />
          <div className="leaf-picker-footer">
            <ButtonControl
              variant="ghost"
              size="sm"
              onClick={() => {
                const now = new Date();
                setDraft({
                  hour: now.getHours(),
                  minute: now.getMinutes(),
                  second: now.getSeconds(),
                });
                setValidText(true);
              }}
            >
              {messages.timePicker.now}
            </ButtonControl>
            <ButtonControl
              size="sm"
              variant="solid"
              disabled={!validText || disabledTime?.(draft)}
              onClick={() => {
                change(draft);
                close();
              }}
            >
              {messages.common.confirm}
            </ButtonControl>
          </div>
        </>
      )}
    />
  );
});
TimePicker.displayName = 'TimePicker';
