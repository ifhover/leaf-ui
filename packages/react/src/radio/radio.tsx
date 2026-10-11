import {
  type ChangeEventHandler,
  type FieldsetHTMLAttributes,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ControlSize;
  variant?: 'plain' | 'card';
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
}
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    size = 'md',
    variant = 'plain',
    description,
    icon,
    extra,
    className,
    style,
    disabled: disabledProp,
    children,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const id = useId();
  const disabled = disabledProp || field?.disabled;
  return (
    <label
      className={classes(
        'leaf-radio',
        `leaf-radio--${size}`,
        `leaf-radio--${variant}`,
        description != null && 'leaf-radio--described',
        className,
      )}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="leaf-radio__control">
        <input
          {...props}
          id={props.id ?? field?.id}
          required={props.required ?? field?.required}
          aria-labelledby={
            props['aria-labelledby'] ??
            (!props['aria-label'] && children != null ? `${id}-label` : undefined)
          }
          aria-describedby={
            [
              props['aria-describedby'],
              field?.descriptionId,
              description != null && `${id}-description`,
              extra != null && `${id}-extra`,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          aria-invalid={field?.error ? true : props['aria-invalid']}
          ref={ref}
          type="radio"
          disabled={disabled}
          className="leaf-radio__input"
        />
        <span className="leaf-radio__mark" />
      </span>
      {icon != null && (
        <span className="leaf-radio__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {(children != null || description != null) && (
        <span className="leaf-radio__copy">
          {children != null && (
            <span id={`${id}-label`} className="leaf-radio__label">
              {children}
            </span>
          )}
          {description != null && (
            <span id={`${id}-description`} className="leaf-radio__description">
              {description}
            </span>
          )}
        </span>
      )}
      {extra != null && (
        <span id={`${id}-extra`} className="leaf-radio__extra">
          {extra}
        </span>
      )}
    </label>
  );
});
Radio.displayName = 'Radio';
export interface RadioOption {
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
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
  label?: ReactNode;
  size?: ControlSize;
  variant?: 'plain' | 'card' | 'list';
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
    variant = 'plain',
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
  const disabled = disabledProp || field?.disabled;
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
      className={classes(
        'leaf-radio-group',
        `leaf-radio-group--${direction}`,
        `leaf-radio-group--${variant}`,
        className,
      )}
    >
      {label && <legend className="leaf-radio-group__legend">{label}</legend>}
      <div className="leaf-radio-group__options">
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${props.id ?? field?.id ?? id}-${option.value}`}
            size={size}
            variant={variant === 'card' ? 'card' : 'plain'}
            description={option.description}
            icon={option.icon}
            extra={option.extra}
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
