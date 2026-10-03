import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { Button } from '../button';
import { useLeafConfig } from '../config-provider/config-provider';
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
}
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = null,
    minuteStep = 5,
    secondStep = 1,
    showSeconds = false,
    use12Hours = false,
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
  const [draft, setDraft] = useState<TimeParts>(
    parseTime(selected) ?? { hour: 9, minute: 0, second: 0 },
  );
  const [validText, setValidText] = useState(true);
  const [open, setOpen] = usePopupState(props.disabled ?? field?.disabled, onOpenChange);
  const change = (parts: TimeParts | null) => {
    const next = parts ? timeString(parts, showSeconds) : null;
    setSelected(next);
    onChange?.(next);
  };
  const formatted = (parts: TimeParts) =>
    displayTime(parts, showSeconds, use12Hours, [messages.am, messages.pm]);
  const parsed = parseTime(selected);
  return (
    <DateInput
      {...props}
      ref={merged}
      className={['leaf-time-picker', props.className].filter(Boolean).join(' ')}
      placeholder={props.placeholder ?? messages.time}
      icon={<Clock3 size={16} aria-hidden="true" />}
      panelLabel={messages.chooseTime}
      clearLabel={messages.clearTime}
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
        const next = parseTime(text.trim());
        setValidText(Boolean(next));
        if (next) setDraft(next);
      }}
      onTextCommit={(text) => {
        if (!text) {
          change(null);
          return true;
        }
        const next = parseTime(text);
        if (!next) return false;
        change(next);
        return true;
      }}
      panelClassName="leaf-time-picker__panel"
      renderPanel={(close) => (
        <>
          <TimePanel
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
            <Button
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
              {messages.now}
            </Button>
            <Button
              size="sm"
              disabled={!validText}
              onClick={() => {
                change(draft);
                close();
              }}
            >
              {messages.confirm}
            </Button>
          </div>
        </>
      )}
    />
  );
});
TimePicker.displayName = 'TimePicker';
