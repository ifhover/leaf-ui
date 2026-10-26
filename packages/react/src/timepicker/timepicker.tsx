import { Clock3 } from 'lucide-react';
import { forwardRef, useRef, useState } from 'react';
import { ButtonControl } from '../button/button';
import { useLeafConfig } from '../config-provider/context';
import { useFormField } from '../form/form';
import { DateInput, type PickerFieldProps } from '../shared/date-input';
import { useFieldValue, useMergedRef } from '../shared/field';
import { usePopupState } from '../shared/floating';
import { pickerSegments, timeDate } from '../shared/segments';
import {
  displayTime,
  parseTime,
  type TimeParts,
  timeInRange,
  timePrecision,
  timeString,
} from '../shared/time';
import { TimePanel } from './time-panel';

export interface TimePickerModeProps extends PickerFieldProps {
  picker: 'time';
  value?: string | null;
  defaultValue?: string | null;
  minuteStep?: number;
  secondStep?: number;
  showSeconds?: boolean;
  use12Hours?: boolean;
  /** Earliest selectable time, inclusive, as `HH:mm` or `HH:mm:ss`. */
  minTime?: string;
  /** Latest selectable time, inclusive, as `HH:mm` or `HH:mm:ss`. */
  maxTime?: string;
  /** Require OK or Enter to commit; dismissing otherwise discards the draft. */
  needConfirm?: boolean;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
  disabledTime?: (parts: TimeParts) => boolean;
}
const nowParts = (): TimeParts => {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
};
export const TimeInput = forwardRef<HTMLInputElement, TimePickerModeProps>(function TimeInput(
  rawProps: TimePickerModeProps,
  ref,
) {
  const {
    picker: _picker,
    value,
    defaultValue = null,
    minuteStep = 1,
    secondStep = 1,
    showSeconds = false,
    use12Hours = false,
    minTime,
    maxTime,
    needConfirm = false,
    onChange,
    onOpenChange,
    disabledTime,
    open: controlledOpen,
    defaultOpen,
    ...props
  } = rawProps;
  const { messages } = useLeafConfig();
  const field = useFormField();
  const trigger = useRef<HTMLInputElement>(null);
  const merged = useMergedRef(trigger, ref);
  const [selected, setSelected] = useFieldValue(value, defaultValue, trigger, props.form);
  const lower = parseTime(minTime);
  const upper = parseTime(maxTime);
  const initialDraft = () => {
    const current = parseTime(selected);
    if (current) return timePrecision(current, showSeconds);
    const fallback = { hour: 9, minute: 0, second: 0 };
    if (lower && !timeInRange(fallback, lower, upper)) return lower;
    if (upper && !timeInRange(fallback, lower, upper)) return upper;
    return fallback;
  };
  const [draft, setDraft] = useState<TimeParts>(initialDraft);
  const [fieldDraft, setFieldDraft] = useState<TimeParts | null>(null);
  const [validText, setValidText] = useState(true);
  // Only a draft the user changed in the panel is committed when the popup is dismissed.
  const touched = useRef(false);
  const [open, setOpen] = usePopupState(
    props.disabled || field?.disabled || props.readOnly,
    onOpenChange,
    controlledOpen,
    defaultOpen,
  );
  const periods = [messages.timePicker.am, messages.timePicker.pm] as const;
  const allowed = (parts: TimeParts) => {
    const next = timePrecision(parts, showSeconds);
    return timeInRange(next, lower, upper) && !disabledTime?.(next);
  };
  const change = (parts: TimeParts | null) => {
    if (!parts && !selected) return;
    if (props.readOnly || props.disabled || field?.disabled || (parts && !allowed(parts))) return;
    const next = parts ? timeString(parts, showSeconds) : null;
    setSelected(next);
    onChange?.(next);
  };
  const updateDraft = (next: TimeParts) => {
    touched.current = true;
    setDraft(next);
    setFieldDraft(next);
    setValidText(true);
  };
  const formatted = (parts: TimeParts) => displayTime(parts, showSeconds, use12Hours, periods);
  const parsed = open && fieldDraft ? fieldDraft : parseTime(selected);
  const committed = parseTime(selected);
  const now = nowParts();
  return (
    <DateInput
      {...props}
      ref={merged}
      segments={pickerSegments(
        'time',
        undefined,
        [parsed ? timeDate(parsed) : null],
        showSeconds,
        use12Hours,
        minuteStep,
        secondStep,
      )}
      className={['leaf-time-picker', props.className].filter(Boolean).join(' ')}
      placeholder={props.placeholder ?? messages.timePicker.placeholder}
      icon={<Clock3 size={16} aria-hidden="true" />}
      panelLabel={messages.timePicker.label}
      clearLabel={messages.timePicker.clear}
      commitOnBlur={!needConfirm}
      onPanelConfirm={() => {
        if (!validText || !allowed(draft)) return false;
        change(draft);
        return true;
      }}
      displayValue={parsed ? formatted(parsed) : ''}
      formValue={committed ? timeString(committed, showSeconds) : ''}
      open={open}
      onOpenChange={setOpen}
      onOpening={() => {
        touched.current = false;
        setDraft(initialDraft());
        setFieldDraft(null);
        setValidText(true);
      }}
      onDismiss={() => {
        if (touched.current && !needConfirm && validText && allowed(draft)) change(draft);
      }}
      onClear={() => {
        change(null);
        setFieldDraft(null);
        touched.current = false;
        setValidText(true);
      }}
      onTextChange={(text) => {
        const next = parseTime(text.trim(), periods);
        setValidText(Boolean(next && allowed(next)));
        if (next) setDraft(timePrecision(next, showSeconds));
      }}
      onTextCommit={(text) => {
        if (!text) {
          change(null);
          return true;
        }
        const next = parseTime(text, periods);
        if (!next || !allowed(next)) return false;
        change(next);
        return true;
      }}
      panelClassName="leaf-time-picker__panel"
      renderPanel={(close) => (
        <>
          <TimePanel
            disabledTime={disabledTime}
            minTime={lower}
            maxTime={upper}
            value={draft}
            onChange={updateDraft}
            minuteStep={minuteStep}
            secondStep={secondStep}
            showSeconds={showSeconds}
            use12Hours={use12Hours}
          />
          <div className="leaf-picker-footer">
            <ButtonControl
              variant="outline"
              size="sm"
              disabled={!allowed(showSeconds ? now : { ...now, second: 0 })}
              onClick={() => updateDraft(showSeconds ? nowParts() : { ...nowParts(), second: 0 })}
            >
              {messages.timePicker.now}
            </ButtonControl>
            <ButtonControl
              size="sm"
              variant="solid"
              disabled={!validText || !allowed(draft)}
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
