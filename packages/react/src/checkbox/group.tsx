import { type FieldsetHTMLAttributes, type ReactNode, useId, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { FieldScope, useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import type { ControlSize } from '../shared/types';
import { CheckboxControl as Checkbox } from './checkbox';
export interface CheckboxOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  disabled?: boolean;
}
export interface CheckboxGroupProps
  extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'onChange' | 'defaultValue'> {
  options: readonly (CheckboxOption | string)[];
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (values: string[]) => void;
  legend?: ReactNode;
  size?: ControlSize;
  variant?: 'plain' | 'card' | 'list';
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}
export function CheckboxGroup(rawProps: CheckboxGroupProps) {
  const {
    options,
    value,
    defaultValue = [],
    onChange,
    legend,
    size,
    variant = 'plain',
    direction = 'horizontal',
    name,
    form,
    required,
    disabled: disabledProp,
    className,
    ...props
  } = useComponentProps('CheckboxGroup', rawProps);
  const field = useFormField();
  const id = useId();
  const disabled = disabledProp || field?.disabled;
  const trigger = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const items: CheckboxOption[] = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
  return (
    <fieldset
      {...props}
      disabled={disabled}
      className={classes(
        'leaf-checkbox-group',
        `leaf-checkbox-group--${direction}`,
        `leaf-checkbox-group--${variant}`,
        className,
      )}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
    >
      {legend && <legend>{legend}</legend>}
      <FieldScope>
        <div className="leaf-checkbox-group__options">
          {items.map((item, index) => {
            const checked = current.includes(item.value);
            return (
              <Checkbox
                key={item.value}
                id={index === 0 ? (field?.id ?? `${id}-${index}`) : `${id}-${index}`}
                ref={index === 0 ? trigger : undefined}
                size={size}
                variant={variant === 'card' ? 'card' : 'plain'}
                description={item.description}
                icon={item.icon}
                extra={item.extra}
                name={name}
                form={form}
                value={item.value}
                checked={checked}
                disabled={disabled || item.disabled}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...current, item.value]
                    : current.filter((key) => key !== item.value);
                  setCurrent(next);
                  onChange?.(next);
                }}
              >
                {item.label}
              </Checkbox>
            );
          })}
        </div>
      </FieldScope>
      <FormValue
        value={current.length > 0 ? 'selected' : ''}
        required={required ?? field?.required}
        form={form}
        disabled={disabled}
        triggerRef={trigger}
      />
    </fieldset>
  );
}
