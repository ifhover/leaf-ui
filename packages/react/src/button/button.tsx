import { LoaderCircle } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ButtonSize = ControlSize;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'solid' */
  variant?: ButtonVariant;
  /** Shared control size. @default 'md' (34px) */
  size?: ButtonSize;
  /** Uses the semantic danger color in every variant. */
  danger?: boolean;
  /** Displays a spinner and prevents repeated interactions. */
  loading?: boolean;
  /** Expands the button to the width of its container. */
  fullWidth?: boolean;
  /** Content before the label. Use aria-label for icon-only buttons. */
  startIcon?: ReactNode;
  /** Content after the label. */
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    size = 'md',
    danger = false,
    loading = false,
    fullWidth = false,
    disabled = false,
    type = 'button',
    className,
    children,
    startIcon,
    endIcon,
    'aria-busy': ariaBusy,
    ...props
  },
  ref,
) {
  const hasLabel =
    children !== undefined && children !== null && children !== false && children !== '';
  const iconOnly = !hasLabel && Boolean(startIcon || endIcon || loading);

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes(
        'leaf-button',
        `leaf-button--${variant}`,
        `leaf-button--${size}`,
        danger && 'leaf-button--danger',
        iconOnly && 'leaf-button--icon-only',
        fullWidth && 'leaf-button--full-width',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || ariaBusy}
      data-loading={loading ? '' : undefined}
    >
      <span className="leaf-button__content">
        {startIcon && (
          <span className="leaf-button__icon" aria-hidden="true">
            {startIcon}
          </span>
        )}
        {hasLabel && <span className="leaf-button__label">{children}</span>}
        {endIcon && (
          <span className="leaf-button__icon" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </span>
      <span className="leaf-button__loading" aria-hidden="true">
        <LoaderCircle className="leaf-button__spinner" />
      </span>
    </button>
  );
});
Button.displayName = 'Button';
