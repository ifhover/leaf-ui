import { CalendarDays } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from './classes';
import { ClearButton } from './clear-button';
import { FormValue, useMergedRef } from './field';
import { FloatingPanel, useFloatingDismiss } from './floating';
import type { ControlSize, ControlStatus } from './types';

export interface PickerFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'size' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  size?: ControlSize;
  status?: ControlStatus;
  allowClear?: boolean;
}
export interface DateInputProps extends PickerFieldProps {
  displayValue: string;
  formValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpening: () => void;
  onClear: () => void;
  onTextCommit: (text: string) => boolean;
  onTextChange?: (text: string) => void;
  commitOnBlur?: boolean;
  renderPanel: (close: () => void) => ReactNode;
  panelClassName?: string;
  clearLabel?: string;
  panelLabel?: string;
  icon?: ReactNode;
}
/** Editable text field with a custom calendar/time popup and canonical FormData value. */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  {
    size = 'md',
    status: statusProp,
    placeholder,
    name,
    required: requiredProp,
    allowClear = true,
    displayValue,
    formValue,
    open,
    onOpenChange,
    onOpening,
    onClear,
    onTextCommit,
    onTextChange,
    commitOnBlur = true,
    renderPanel,
    panelClassName,
    clearLabel,
    panelLabel,
    icon,
    className,
    style,
    disabled: disabledProp,
    id: idProp,
    onClick,
    onKeyDown,
    onBlur,
    form,
    ...props
  },
  forwardedRef,
) {
  const field = useFormField();
  const { messages } = useLeafConfig();
  const disabled = disabledProp ?? field?.disabled;
  const required = requiredProp ?? field?.required;
  const input = useRef<HTMLInputElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-picker-panel`;
  const ref = useMergedRef(input, forwardedRef);
  const [text, setText] = useState(displayValue);
  const [dirty, setDirty] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [focusPanel, setFocusPanel] = useState(false);
  const status = statusProp ?? (invalid || field?.error ? 'error' : undefined);
  const restore = () => {
    setText(displayValue);
    setDirty(false);
    setInvalid(false);
  };
  const close = () => {
    onOpenChange(false);
    restore();
  };
  const finish = () => {
    onOpenChange(false);
    restore();
    input.current?.focus();
  };
  const opening = () => {
    if (!open && !disabled) {
      onOpening();
      onOpenChange(true);
    }
  };
  useFloatingDismiss(
    open,
    (reason) => {
      if (reason === 'escape' || !dirty || !commitOnBlur) close();
      else {
        const valid = onTextCommit(text.trim());
        setInvalid(!valid);
        if (valid) restore();
        onOpenChange(false);
      }
    },
    input,
    panel,
    root,
  );
  useEffect(() => {
    setText(displayValue);
    setDirty(false);
    setInvalid(false);
  }, [displayValue]);
  useEffect(() => {
    input.current?.setCustomValidity(invalid ? messages.invalid : '');
  }, [invalid, messages.invalid]);
  useEffect(() => {
    if (open && focusPanel) {
      (
        panel.current?.querySelector<HTMLElement>('[tabindex="0"]:not(:disabled)') ??
        panel.current?.querySelector<HTMLElement>('button:not(:disabled)')
      )?.focus();
      setFocusPanel(false);
    }
  }, [open, focusPanel]);
  useEffect(() => {
    const owner = input.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          setText(displayValue);
          setDirty(false);
          setInvalid(false);
          onOpenChange(false);
        }
      });
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  }, [displayValue, onOpenChange]);
  const commitText = (focus = true) => {
    const valid = onTextCommit(text.trim());
    setInvalid(!valid);
    if (valid) {
      restore();
      onOpenChange(false);
      if (focus) input.current?.focus();
    }
    return valid;
  };
  return (
    <div
      ref={root}
      className={classes('leaf-date-picker', `leaf-date-picker--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && (formValue || text) && !disabled ? '' : undefined}
    >
      <input
        {...props}
        ref={ref}
        id={idProp ?? field?.id}
        type="text"
        form={form}
        className="leaf-date-picker__input"
        disabled={disabled}
        value={dirty ? text : displayValue}
        placeholder={placeholder ?? messages.date}
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-required={required || undefined}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-describedby={
          [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
        }
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) opening();
        }}
        onChange={(event) => {
          opening();
          setText(event.target.value);
          setDirty(true);
          setInvalid(false);
          onTextChange?.(event.target.value);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (
            event.defaultPrevented ||
            root.current?.contains(event.relatedTarget) ||
            panel.current?.contains(event.relatedTarget)
          )
            return;
          if (dirty) {
            if (commitOnBlur) commitText(false);
            else restore();
          }
        }}
        onInvalid={(event) => {
          props.onInvalid?.(event);
          event.preventDefault();
          input.current?.focus();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.nativeEvent.isComposing) return;
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            opening();
            setFocusPanel(true);
          } else if (event.key === 'Enter') {
            event.preventDefault();
            if (dirty) commitText();
            else opening();
          } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      />
      {allowClear && (formValue || text) && !disabled && (
        <ClearButton
          label={clearLabel ?? messages.clearDate}
          onClear={() => {
            onClear();
            setText('');
            setDirty(false);
            setInvalid(false);
            finish();
          }}
        />
      )}
      <button
        type="button"
        className="leaf-date-picker__icon"
        tabIndex={-1}
        disabled={disabled}
        aria-label={panelLabel ?? messages.chooseDate}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (open) close();
          else {
            opening();
            setFocusPanel(true);
          }
        }}
      >
        {icon ?? <CalendarDays size={16} aria-hidden="true" />}
      </button>
      <FormValue
        name={name}
        form={form}
        value={formValue}
        disabled={disabled}
        required={required}
        triggerRef={input}
      />
      <FloatingPanel
        open={open}
        triggerRef={root}
        panelRef={panel}
        id={panelId}
        className={classes('leaf-floating', panelClassName)}
        role="dialog"
        aria-label={panelLabel ?? messages.chooseDate}
      >
        {renderPanel(finish)}
      </FloatingPanel>
    </div>
  );
});
