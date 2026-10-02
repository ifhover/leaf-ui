import {
  forwardRef,
  type InputHTMLAttributes,
  type KeyboardEventHandler,
  type ReactNode,
} from 'react';
import { classes } from '../shared/classes';
import type { ControlSize, ControlStatus } from '../shared/types';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  size?: ControlSize;
  status?: ControlStatus;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Called on Enter, excluding IME composition and prevented events. */
  onPressEnter?: KeyboardEventHandler<HTMLInputElement>;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size = 'md',
    status,
    prefix,
    suffix,
    className,
    style,
    disabled,
    onKeyDown,
    onPressEnter,
    'aria-invalid': ariaInvalid,
    ...props
  },
  ref,
) {
  return (
    <div
      className={classes('leaf-input', `leaf-input--${size}`, className)}
      style={style}
      data-status={status}
      data-disabled={disabled ? '' : undefined}
    >
      {prefix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {prefix}
        </span>
      )}
      <input
        {...props}
        ref={ref}
        disabled={disabled}
        className="leaf-input__native"
        aria-invalid={status === 'error' ? true : ariaInvalid}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'Enter' && !event.nativeEvent.isComposing && !event.defaultPrevented) {
            onPressEnter?.(event);
          }
        }}
      />
      {suffix && (
        <span className="leaf-input__affix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </div>
  );
});
Input.displayName = 'Input';
