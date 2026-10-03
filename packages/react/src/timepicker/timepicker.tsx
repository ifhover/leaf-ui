import { Check, ChevronDown, Clock3 } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { classes } from '../shared/classes';
import { ClearButton } from '../shared/clear-button';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { FloatingPanel, useFloatingDismiss, usePopupState } from '../shared/floating';
import type { ControlSize, ControlStatus } from '../shared/types';

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
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  form?: string;
  onChange?: (value: string | null) => void;
  onOpenChange?: (open: boolean) => void;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function parseTime(value: string | null | undefined) {
  const match = value?.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = null,
    size = 'md',
    status,
    placeholder = '请选择时间',
    minuteStep = 5,
    name,
    required,
    allowClear = true,
    form,
    className,
    style,
    disabled,
    id,
    onChange,
    onOpenChange,
    onClick,
    onKeyDown,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...props
  },
  forwardedRef,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const panelId = `${generatedId}-time-panel`;
  const [selectedValue, setSelectedValue] = useFieldValue(value, defaultValue, triggerRef, form);
  const [draftHour, setDraftHour] = useState(parseTime(selectedValue)?.hour ?? 9);
  const [draftMinute, setDraftMinute] = useState(parseTime(selectedValue)?.minute ?? 0);
  const [open, setOpen] = usePopupState(disabled, onOpenChange);
  const step = Number.isFinite(minuteStep) ? Math.max(1, Math.min(60, Math.floor(minuteStep))) : 5;
  const hourOptions = Array.from({ length: 24 }, (_, hour) => hour);
  const minuteOptions = Array.from(
    { length: Math.ceil(60 / step) },
    (_, index) => index * step,
  ).filter((minute) => minute < 60);
  if (!minuteOptions.includes(draftMinute)) minuteOptions.push(draftMinute);
  minuteOptions.sort((a, b) => a - b);

  useEffect(() => {
    if (!open) return;
    const selected = panelRef.current?.querySelector<HTMLButtonElement>(
      '[aria-label="小时"] [aria-selected="true"]',
    );
    selected?.focus();
    selected?.scrollIntoView?.({ block: 'nearest' });
  }, [open]);

  const columnKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    options: number[],
    current: number,
    setDraft: (value: number) => void,
  ) => {
    const index = options.indexOf(current);
    let next = index;
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;
    event.preventDefault();
    const option = options[next];
    if (option !== undefined) setDraft(option);
    const button =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')[next];
    button?.focus();
    button?.scrollIntoView?.({ block: 'nearest' });
  };

  const setTriggerRef = useMergedRef(triggerRef, forwardedRef);

  const close = () => {
    setOpen(false);
  };

  useFloatingDismiss(open, close, triggerRef, panelRef);

  const openPanel = () => {
    if (disabled) return;
    const parsed = parseTime(selectedValue);
    setDraftHour(parsed?.hour ?? 9);
    setDraftMinute(parsed?.minute ?? 0);
    setOpen(true);
  };

  const commit = (hour: number, minute: number) => {
    const next = `${pad(hour)}:${pad(minute)}`;
    setSelectedValue(next);
    onChange?.(next);
    close();
    triggerRef.current?.focus();
  };

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
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
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
          {selectedValue || placeholder}
        </span>
        <ChevronDown className="leaf-time-picker__arrow" aria-hidden="true" />
      </button>
      {allowClear && selectedValue && !disabled && (
        <ClearButton
          label="清除时间"
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
        value={selectedValue ?? ''}
        disabled={disabled}
        required={required}
        triggerRef={triggerRef}
      />
      {open && (
        <FloatingPanel
          triggerRef={triggerRef}
          panelRef={panelRef}
          id={panelId}
          className="leaf-floating leaf-time-picker__panel"
          role="dialog"
          aria-label="选择时间"
        >
          <div className="leaf-time-picker__columns">
            <div className="leaf-time-picker__column" role="listbox" aria-label="小时">
              {hourOptions.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  role="option"
                  tabIndex={draftHour === hour ? 0 : -1}
                  aria-selected={draftHour === hour}
                  className="leaf-floating__option"
                  onClick={() => setDraftHour(hour)}
                  onKeyDown={(event) => columnKey(event, hourOptions, hour, setDraftHour)}
                >
                  {pad(hour)}
                  {draftHour === hour && <Check size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
            <div className="leaf-time-picker__separator">:</div>
            <div className="leaf-time-picker__column" role="listbox" aria-label="分钟">
              {minuteOptions.map((minute) => (
                <button
                  key={minute}
                  type="button"
                  role="option"
                  tabIndex={draftMinute === minute ? 0 : -1}
                  aria-selected={draftMinute === minute}
                  className="leaf-floating__option"
                  onClick={() => {
                    setDraftMinute(minute);
                    commit(draftHour, minute);
                  }}
                  onKeyDown={(event) => columnKey(event, minuteOptions, minute, setDraftMinute)}
                >
                  {pad(minute)}
                  {draftMinute === minute && <Check size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>
          <div className="leaf-time-picker__footer">
            <button type="button" onClick={() => commit(draftHour, draftMinute)}>
              使用 {pad(draftHour)}:{pad(draftMinute)}
            </button>
          </div>
        </FloatingPanel>
      )}
    </div>
  );
});

TimePicker.displayName = 'TimePicker';
