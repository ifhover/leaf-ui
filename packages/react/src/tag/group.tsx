import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useRef,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue, useMergedRef } from '../shared/field';
import { useListMotion } from '../shared/motion';
import type { ControlSize } from '../shared/types';
import { useControllable } from '../shared/use-controllable';
export interface CheckableTagProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ControlSize;
}
export const CheckableTag = forwardRef<HTMLButtonElement, CheckableTagProps>(function CheckableTag(
  rawProps: CheckableTagProps,
  ref,
) {
  const {
    checked,
    defaultChecked = false,
    onChange,
    size = 'md',
    children,
    className,
    onClick,
    ...props
  } = useComponentProps('CheckableTag', rawProps);
  const [current, change] = useControllable(checked, defaultChecked, onChange);
  return (
    <button
      {...props}
      ref={ref}
      type={props.type ?? 'button'}
      className={classes(
        'leaf-tag',
        `leaf-tag--${current ? 'solid' : 'soft'}`,
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
});
CheckableTag.displayName = 'CheckableTag';
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
export const TagGroup = forwardRef<HTMLDivElement, TagGroupProps>(function TagGroup(
  rawProps: TagGroupProps,
  forwardedRef,
) {
  const {
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
  } = useComponentProps('TagGroup', rawProps);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const ref = useMergedRef(root, forwardedRef);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  useListMotion(
    root,
    JSON.stringify(options.map((option) => option.value)),
    '.leaf-checkable-tag[data-motion-key]',
  );
  return (
    <div {...props} ref={ref} className={classes('leaf-tag-group', className)}>
      {options.map((option, index) => {
        const selected = current.includes(option.value);
        return (
          <button
            key={option.value}
            ref={index === 0 ? trigger : undefined}
            type="button"
            className={classes(
              'leaf-tag',
              `leaf-tag--${selected ? 'solid' : 'soft'}`,
              `leaf-tag--${size ?? 'md'}`,
              'leaf-checkable-tag',
            )}
            data-color={selected ? 'primary' : 'default'}
            data-motion-key={option.value}
            aria-pressed={selected}
            disabled={disabled || option.disabled}
            onClick={() => {
              const next = selected
                ? current.filter((key) => key !== option.value)
                : [...current, option.value];
              setCurrent(next);
              onChange?.(next);
            }}
          >
            {option.label}
          </button>
        );
      })}
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
});
TagGroup.displayName = 'TagGroup';
