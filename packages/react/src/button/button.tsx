import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'solid' */
  variant?: ButtonVariant;
  /** Button size. @default 'md' */
  size?: ButtonSize;
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
  const classes = [
    'leaf-button',
    `leaf-button--${variant}`,
    `leaf-button--${size}`,
    fullWidth && 'leaf-button--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || ariaBusy}
      data-loading={loading ? '' : undefined}
    >
      {loading ? (
        <span className="leaf-button__spinner" aria-hidden="true" />
      ) : startIcon ? (
        <span className="leaf-button__icon" aria-hidden="true">
          {startIcon}
        </span>
      ) : null}
      {children !== null && children !== undefined && (
        <span className="leaf-button__label">{children}</span>
      )}
      {endIcon && (
        <span className="leaf-button__icon" aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
