import {
  type ChangeEventHandler,
  type FieldsetHTMLAttributes,
  forwardRef,
  type InputHTMLAttributes,
  useId,
} from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ControlSize;
}
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = 'md', className, style, disabled: disabledProp, children, ...props },
  ref,
) {
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  return (
    <label
      className={classes('leaf-radio', `leaf-radio--${size}`, className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="leaf-radio__control">
        <input
          {...props}
          id={props.id ?? field?.id}
          required={props.required ?? field?.required}
          aria-describedby={
            [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={field?.error ? true : props['aria-invalid']}
          ref={ref}
          type="radio"
          disabled={disabled}
          className="leaf-radio__input"
        />
        <span className="leaf-radio__mark" />
      </span>
      {children && <span className="leaf-radio__label">{children}</span>}
    </label>
  );
});
Radio.displayName = 'Radio';
export interface RadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}
export interface RadioGroupProps
  extends Omit<
    FieldsetHTMLAttributes<HTMLFieldSetElement>,
    'onChange' | 'defaultValue' | 'children'
  > {
  options: readonly RadioOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  label?: string;
  size?: ControlSize;
  direction?: 'horizontal' | 'vertical';
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    options,
    value,
    defaultValue,
    name,
    label,
    size = 'md',
    direction = 'horizontal',
    required,
    onChange,
    disabled: disabledProp,
    className,
    ...props
  },
  ref,
) {
  const id = useId();
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  return (
    <fieldset
      {...props}
      ref={ref}
      id={props.id ?? field?.id}
      aria-labelledby={props['aria-labelledby'] ?? (!label ? field?.labelId : undefined)}
      aria-describedby={
        [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
      }
      aria-invalid={field?.error ? true : props['aria-invalid']}
      tabIndex={-1}
      disabled={disabled}
      className={classes('leaf-radio-group', `leaf-radio-group--${direction}`, className)}
    >
      {label && <legend className="leaf-radio-group__legend">{label}</legend>}
      <div className="leaf-radio-group__options">
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${props.id ?? field?.id ?? id}-${option.value}`}
            size={size}
            name={name ?? id}
            value={option.value}
            disabled={disabled || option.disabled}
            required={required ?? field?.required}
            checked={value === undefined ? undefined : value === option.value}
            defaultChecked={value === undefined ? defaultValue === option.value : undefined}
            onChange={onChange}
          >
            {option.label}
          </Radio>
        ))}
      </div>
    </fieldset>
  );
});
RadioGroup.displayName = 'RadioGroup';
