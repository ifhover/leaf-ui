import { LoaderCircle } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { useFormField } from '../form/form';
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
    disabled: disabledProp,
    children,
    className,
    style,
    'aria-busy': ariaBusy,
    ...props
  },
  ref,
) {
  const field = useFormField();
  const disabled = disabledProp ?? field?.disabled;
  return (
    <label
      className={classes('leaf-switch', `leaf-switch--${size}`, className)}
      style={style}
      data-disabled={disabled || loading ? '' : undefined}
      data-loading={loading ? '' : undefined}
    >
      <span className="leaf-switch__control">
        <input
          {...props}
          id={props.id ?? field?.id}
          required={props.required ?? field?.required}
          aria-describedby={
            [props['aria-describedby'], field?.descriptionId].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={field?.error ? true : props['aria-invalid']}
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
