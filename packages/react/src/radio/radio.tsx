import {
  type ChangeEventHandler,
  type FieldsetHTMLAttributes,
  forwardRef,
  type InputHTMLAttributes,
  useId,
} from 'react';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ControlSize;
}
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { size = 'md', className, style, disabled, children, ...props },
  ref,
) {
  return (
    <label
      className={classes('leaf-radio', `leaf-radio--${size}`, className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="leaf-radio__control">
        <input
          {...props}
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
    disabled,
    className,
    ...props
  },
  ref,
) {
  const id = useId();
  return (
    <fieldset
      {...props}
      ref={ref}
      disabled={disabled}
      className={classes('leaf-radio-group', `leaf-radio-group--${direction}`, className)}
    >
      {label && <legend className="leaf-radio-group__legend">{label}</legend>}
      <div className="leaf-radio-group__options">
        {options.map((option) => (
          <Radio
            key={option.value}
            size={size}
            name={name ?? id}
            value={option.value}
            disabled={disabled || option.disabled}
            required={required}
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
