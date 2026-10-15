import { Check, Minus } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { useFormField } from '../form/form';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ControlSize;
  variant?: 'plain' | 'card';
  description?: ReactNode;
  icon?: ReactNode;
  /** Non-interactive supplementary content, such as a status tag. */
  extra?: ReactNode;
  /** Displays mixed selection; it does not change the submitted value. */
  indeterminate?: boolean;
}
export const CheckboxControl = forwardRef<HTMLInputElement, CheckboxProps>(function CheckboxControl(
  {
    size = 'md',
    variant = 'plain',
    description,
    icon,
    extra,
    indeterminate = false,
    className,
    style,
    disabled: disabledProp,
    children,
    ...props
  }: CheckboxProps,
  ref,
) {
  const field = useFormField();
  const id = useId();
  const disabled = disabledProp || field?.disabled;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={classes(
        'leaf-checkbox',
        `leaf-checkbox--${size}`,
        `leaf-checkbox--${variant}`,
        description != null && 'leaf-checkbox--described',
        className,
      )}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="leaf-checkbox__control">
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
          ref={inputRef}
          type="checkbox"
          className="leaf-checkbox__input"
          disabled={disabled}
        />
        <Check className="leaf-checkbox__mark leaf-checkbox__mark--check" aria-hidden="true" />
        <Minus className="leaf-checkbox__mark leaf-checkbox__mark--mixed" aria-hidden="true" />
      </span>
      {icon != null && (
        <span className="leaf-checkbox__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {(children != null || description != null) && (
        <span className="leaf-checkbox__copy">
          {children != null && (
            <span id={`${id}-label`} className="leaf-checkbox__label">
              {children}
            </span>
          )}
          {description != null && (
            <span id={`${id}-description`} className="leaf-checkbox__description">
              {description}
            </span>
          )}
        </span>
      )}
      {extra != null && (
        <span id={`${id}-extra`} className="leaf-checkbox__extra">
          {extra}
        </span>
      )}
    </label>
  );
});
CheckboxControl.displayName = 'CheckboxControl';

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  rawProps: CheckboxProps,
  ref,
) {
  const props = useComponentProps('Checkbox', rawProps);
  return <CheckboxControl {...props} ref={ref} />;
});
Checkbox.displayName = 'Checkbox';
