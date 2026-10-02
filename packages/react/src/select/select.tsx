import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { classes } from '../shared/classes';
import type { ControlSize, ControlStatus } from '../shared/types';
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'multiple' | 'children'> {
  options: readonly SelectOption[];
  size?: ControlSize;
  status?: ControlStatus;
  /** Placeholder uses an empty value. Reserve '' for no selection. */
  placeholder?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    size = 'md',
    status,
    placeholder,
    className,
    style,
    disabled,
    defaultValue,
    value,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  return (
    <div
      className={classes('leaf-select', `leaf-select--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      <select
        {...props}
        ref={ref}
        disabled={disabled}
        value={value}
        defaultValue={
          value === undefined ? (defaultValue ?? (placeholder ? '' : undefined)) : undefined
        }
        className="leaf-select__native"
        aria-invalid={status === 'error' ? true : ariaInvalid}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="leaf-select__arrow" aria-hidden="true" />
    </div>
  );
});
Select.displayName = 'Select';
