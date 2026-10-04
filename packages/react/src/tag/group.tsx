import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, useRef } from 'react';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import type { ControlSize } from '../shared/types';
import { useControllable } from '../shared/use-controllable';
export interface CheckableTagProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
}
export function CheckableTag({
  checked,
  defaultChecked = false,
  onChange,
  size = 'md',
  children,
  className,
  onClick,
  ...props
}: CheckableTagProps) {
  const [current, change] = useControllable(checked, defaultChecked, onChange);
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={classes(
        'leaf-tag',
        'leaf-tag--soft',
        `leaf-tag--${size}`,
        'leaf-checkable-tag',
        className,
      )}
      aria-pressed={current}
      data-color={current ? 'primary' : 'default'}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) change(!current);
      }}
    >
      {children}
    </button>
  );
}
export interface TagOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}
export interface TagGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  options: readonly TagOption[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  size?: ControlSize;
  name?: string;
  form?: string;
  required?: boolean;
}
export function TagGroup({
  options,
  value,
  defaultValue = [],
  onChange,
  disabled,
  size,
  name,
  form,
  required,
  className,
  ...props
}: TagGroupProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  return (
    <div {...props} className={classes('leaf-tag-group', className)}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={index === 0 ? trigger : undefined}
          type="button"
          className={classes(
            'leaf-tag',
            'leaf-tag--soft',
            `leaf-tag--${size ?? 'md'}`,
            'leaf-checkable-tag',
          )}
          data-color={current.includes(option.value) ? 'primary' : 'default'}
          aria-pressed={current.includes(option.value)}
          disabled={disabled || option.disabled}
          onClick={() => {
            const next = current.includes(option.value)
              ? current.filter((key) => key !== option.value)
              : [...current, option.value];
            setCurrent(next);
            onChange?.(next);
          }}
        >
          {option.label}
        </button>
      ))}
      <FormValue
        name={name}
        form={form}
        required={required}
        disabled={disabled}
        value={current.length ? JSON.stringify(current) : ''}
        triggerRef={trigger}
      />
    </div>
  );
}
