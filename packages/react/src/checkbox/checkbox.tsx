import { Check, Minus } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: ControlSize;
  /** Displays mixed selection; it does not change the submitted value. */
  indeterminate?: boolean;
}
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { size = 'md', indeterminate = false, className, style, disabled, children, ...props },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={classes('leaf-checkbox', `leaf-checkbox--${size}`, className)}
      style={style}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="leaf-checkbox__control">
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          className="leaf-checkbox__input"
          disabled={disabled}
        />
        <Check className="leaf-checkbox__mark leaf-checkbox__mark--check" aria-hidden="true" />
        <Minus className="leaf-checkbox__mark leaf-checkbox__mark--mixed" aria-hidden="true" />
      </span>
      {children && <span className="leaf-checkbox__label">{children}</span>}
    </label>
  );
});
Checkbox.displayName = 'Checkbox';
