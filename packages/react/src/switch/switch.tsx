import { LoaderCircle } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';
export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'role'> {
  size?: ControlSize;
  loading?: boolean;
}
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    size = 'md',
    loading = false,
    disabled,
    children,
    className,
    style,
    'aria-busy': ariaBusy,
    ...props
  },
  ref,
) {
  return (
    <label
      className={classes('leaf-switch', `leaf-switch--${size}`, className)}
      style={style}
      data-disabled={disabled || loading ? '' : undefined}
    >
      <span className="leaf-switch__control">
        <input
          {...props}
          ref={ref}
          type="checkbox"
          // biome-ignore lint/a11y/useAriaPropsForRole: Native checked state supplies switch semantics and follows form reset.
          role="switch"
          disabled={disabled || loading}
          aria-busy={loading || ariaBusy}
          className="leaf-switch__input"
        />
        <span className="leaf-switch__track" aria-hidden="true">
          <span className="leaf-switch__thumb">
            {loading && <LoaderCircle className="leaf-switch__spinner" />}
          </span>
        </span>
      </span>
      {children && <span className="leaf-switch__label">{children}</span>}
    </label>
  );
});
Switch.displayName = 'Switch';
