import { ChevronDown, Clock3 } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, useId, useRef, useState } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import { displayTime, parseTime, type TimeParts, timeString } from '../shared/time';
import type { ControlSize, ControlStatus } from '../shared/types';
import { TimePanel } from './time-panel';

export interface TimePickerProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  value?: string | null;
  defaultValue?: string | null;
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  minuteStep?: number;
  secondStep?: number;
  showSeconds?: boolean;
  use12Hours?: boolean;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  form?: string;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
}
export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = null,
    size = 'md',
    status: statusProp,
    placeholder,
    minuteStep = 5,
    secondStep = 1,
    showSeconds = false,
    use12Hours = false,
    name,
    required: requiredProp,
    allowClear = true,
    form,
    className,
    style,
    disabled: disabledProp,
    id: idProp,
    onChange,
    onOpenChange,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedByProp,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const { messages } = useLeafConfig();
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  const required = requiredProp ?? field?.required;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const id = idProp ?? field?.id;
  const ariaDescribedBy =
    [ariaDescribedByProp, field?.descriptionId].filter(Boolean).join(' ') || undefined;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-time-panel`;
  const [selectedValue, setSelectedValue] = useFieldValue(value, defaultValue, triggerRef, form);
  const [draft, setDraft] = useState<TimeParts>(
    parseTime(selectedValue) ?? { hour: 9, minute: 0, second: 0 },
  );
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const setTriggerRef = useMergedRef(triggerRef, forwardedRef);
  const close = () => setOpen(false);
  useFloatingDismiss(open, close, triggerRef, panelRef);
  const openPanel = () => {
    if (disabled) return;
    setDraft(parseTime(selectedValue) ?? { hour: 9, minute: 0, second: 0 });
    setOpen(true);
  };
  const commit = (parts: TimeParts) => {
    const next = timeString(parts, showSeconds);
    setSelectedValue(next);
    onChange?.(next);
    close();
    triggerRef.current?.focus();
  };
  const formatted = (parts: TimeParts) =>
    displayTime(parts, showSeconds, use12Hours, [messages.am, messages.pm]);
  const parsed = parseTime(selectedValue);
  return (
    <div
      className={classes('leaf-time-picker', `leaf-time-picker--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && selectedValue && !disabled ? '' : undefined}
    >
      <button
        {...props}
        ref={setTriggerRef}
        id={id}
        form={form}
        type="button"
        className="leaf-time-picker__trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status === 'error' ? true : ariaInvalid}
        aria-required={required || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            if (open) close();
            else openPanel();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            if (!open) openPanel();
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        <Clock3 size={16} aria-hidden="true" />
        <span className={!selectedValue ? 'leaf-time-picker__placeholder' : undefined}>
          {parsed ? formatted(parsed) : placeholder || messages.time}
        </span>
        <ChevronDown className="leaf-time-picker__arrow" aria-hidden="true" />
      </button>
      {allowClear && selectedValue && !disabled && (
        <ClearButton
          label={messages.clearTime}
          beforeArrow
          onClear={() => {
            setSelectedValue(null);
            onChange?.(null);
            close();
            triggerRef.current?.focus();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        value={parsed ? timeString(parsed, showSeconds) : ''}
        disabled={disabled}
        required={required}
        triggerRef={triggerRef}
      />
      <FloatingPanel
        open={open}
        triggerRef={triggerRef}
        panelRef={panelRef}
        id={panelId}
        className="leaf-floating leaf-time-picker__panel"
        role="dialog"
        aria-label={messages.chooseTime}
      >
        <TimePanel
          value={draft}
          onChange={setDraft}
          minuteStep={minuteStep}
          secondStep={secondStep}
          showSeconds={showSeconds}
          use12Hours={use12Hours}
          autoFocus={open}
          onMinuteCommit={!showSeconds && !use12Hours ? commit : undefined}
        />
        <div className="leaf-time-picker__footer">
          <button type="button" onClick={() => commit(draft)}>
            {messages.useTime} {formatted(draft)}
          </button>
        </div>
      </FloatingPanel>
    </div>
  );
});
TimePicker.displayName = 'TimePicker';
