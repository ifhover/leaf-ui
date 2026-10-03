import { CalendarDays } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode, useId, useRef } from 'react';
import { useLeafConfig } from '../config-provider/config-provider';
import { useFormField } from '../form/form';
import { classes } from './classes';
import { ClearButton } from './clear-button';
import { FormValue, useMergedRef } from './field';
import { FloatingPanel, useFloatingDismiss } from './floating';
import type { ControlSize, ControlStatus } from './types';
export interface DateInputProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children'
  > {
  size?: ControlSize;
  status?: ControlStatus;
  placeholder?: string;
  name?: string;
  required?: boolean;
  allowClear?: boolean;
  displayValue: string;
  formValue: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpening: () => void;
  onClear: () => void;
  renderPanel: (close: () => void) => ReactNode;
  panelClassName?: string;
  clearLabel?: string;
}
export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(function DateInput(
  {
    size = 'md',
    status: statusProp,
    placeholder,
    name,
    required: requiredProp,
    allowClear = true,
    displayValue,
    formValue,
    open: requested,
    onOpenChange,
    onOpening,
    onClear,
    renderPanel,
    panelClassName,
    clearLabel,
    className,
    style,
    disabled: disabledProp,
    id: idProp,
    onClick,
    onKeyDown,
    form,
    ...props
  },
  forwardedRef,
) {
  const field = useFormField();
  const { messages } = useLeafConfig();
  const disabled = disabledProp ?? field?.disabled;
  const required = requiredProp ?? field?.required;
  const status = statusProp ?? (field?.error ? 'error' : undefined);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelId = `${useId()}-date-panel`;
  const merged = useMergedRef(trigger, forwardedRef);
  const open = requested && !disabled;
  const close = () => onOpenChange(false);
  const finish = () => {
    close();
    trigger.current?.focus();
  };
  useFloatingDismiss(open, close, trigger, panel);
  return (
    <div
      className={classes('leaf-date-picker', `leaf-date-picker--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
      data-open={open ? '' : undefined}
      data-clearable={allowClear && formValue && !disabled ? '' : undefined}
    >
      <button
        {...props}
        ref={merged}
        id={idProp ?? field?.id}
        type="button"
        form={form}
        className="leaf-date-picker__trigger"
        disabled={disabled}
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
          if (event.defaultPrevented) return;
          if (open) close();
          else {
            onOpening();
            onOpenChange(true);
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
            event.preventDefault();
            if (!open) {
              onOpening();
              onOpenChange(true);
            }
          } else if (event.key === 'Escape' && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
          }
        }}
      >
        <CalendarDays size={16} aria-hidden="true" />
        <span className={!displayValue ? 'leaf-date-picker__placeholder' : undefined}>
          {displayValue || placeholder || messages.date}
        </span>
      </button>
      {allowClear && formValue && !disabled && (
        <ClearButton
          label={clearLabel ?? messages.clearDate}
          onClear={() => {
            onClear();
            finish();
          }}
        />
      )}
      <FormValue
        name={name}
        form={form}
        value={formValue}
        disabled={disabled}
        required={required}
        triggerRef={trigger}
      />
      <FloatingPanel
        open={open}
        triggerRef={trigger}
        panelRef={panel}
        id={panelId}
        className={classes('leaf-floating', panelClassName)}
        role="dialog"
        aria-label={placeholder || messages.chooseDate}
      >
        {renderPanel(finish)}
      </FloatingPanel>
    </div>
  );
});
