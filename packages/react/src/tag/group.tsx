import { type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import { useListMotion } from '../shared/motion';
import type { ControlSize } from '../shared/types';
import { useControllable } from '../shared/use-controllable';
export interface CheckableTagProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
  bold?: boolean;
}
export function CheckableTag(rawProps: CheckableTagProps) {
  const {
    checked,
    defaultChecked = false,
    onChange,
    size = 'md',
    bold = true,
    children,
    className,
    onClick,
    ...props
  } = useComponentProps('CheckableTag', rawProps);
  const [current, change] = useControllable(checked, defaultChecked, onChange);
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={classes(
        'leaf-tag',
        'leaf-tag--soft',
        `leaf-tag--${size}`,
        bold && 'leaf-tag--bold',
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
  bold?: boolean;
  name?: string;
  form?: string;
  required?: boolean;
}
export function TagGroup(rawProps: TagGroupProps) {
  const {
    options,
    value,
    defaultValue = [],
    onChange,
    disabled,
    size,
    bold = true,
    name,
    form,
    required,
    className,
    ...props
  } = useComponentProps('TagGroup', rawProps);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  useListMotion(
    root,
    JSON.stringify(options.map((option) => option.value)),
    '.leaf-checkable-tag[data-motion-key]',
  );
  return (
    <div {...props} ref={root} className={classes('leaf-tag-group', className)}>
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={index === 0 ? trigger : undefined}
          type="button"
          className={classes(
            'leaf-tag',
            'leaf-tag--soft',
            `leaf-tag--${size ?? 'md'}`,
            bold && 'leaf-tag--bold',
            'leaf-checkable-tag',
          )}
          data-color={current.includes(option.value) ? 'primary' : 'default'}
          data-motion-key={option.value}
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
