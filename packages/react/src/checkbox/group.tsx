import { type FieldsetHTMLAttributes, type ReactNode, useRef } from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import { FormValue, useFieldValue } from '../shared/field';
import type { ControlSize } from '../shared/types';
import { Checkbox } from './checkbox';
export interface CheckboxOption {
  value: string;
  label: ReactNode;
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
  minCount?: number;
  maxCount?: number;
  required?: boolean;
  direction?: 'horizontal' | 'vertical';
}
export function CheckboxGroup({
  options,
  value,
  defaultValue = [],
  onChange,
  legend,
  size,
  minCount = 0,
  maxCount = Infinity,
  direction = 'horizontal',
  name,
  form,
  required,
  disabled: disabledProp,
  className,
  ...props
}: CheckboxGroupProps) {
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  const trigger = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useFieldValue(value, defaultValue, trigger, form);
  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
  return (
    <fieldset
      {...props}
      disabled={disabled}
      className={classes('leaf-checkbox-group', `leaf-checkbox-group--${direction}`, className)}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
    >
      {legend && <legend>{legend}</legend>}
      <div className="leaf-checkbox-group__options">
        {items.map((item, index) => {
          const checked = current.includes(item.value);
          const limited = checked
            ? current.length <= Math.max(0, minCount)
            : current.length >= Math.max(0, maxCount);
          return (
            <Checkbox
              key={item.value}
              ref={index === 0 ? trigger : undefined}
              size={size}
              name={name}
              form={form}
              value={item.value}
              checked={checked}
              disabled={disabled || item.disabled}
              aria-disabled={limited || undefined}
              onChange={(event) => {
                if (limited) {
                  event.currentTarget.checked = checked;
                  return;
                }
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
      <FormValue
        value={current.length >= Math.max(1, minCount) ? 'selected' : ''}
        required={required ?? field?.required}
        form={form}
        disabled={disabled}
        triggerRef={trigger}
      />
    </fieldset>
  );
}
