import { LoaderCircle } from 'lucide-react';
import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import type { ControlSize } from '../shared/types';

export type ButtonVariant = 'solid' | 'outline' | 'link';
export type ButtonSize = ControlSize;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default 'outline' */
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

interface ButtonControlProps extends Omit<ButtonProps, 'variant'> {
  /** Borderless controls remain an implementation detail of their owning components. */
  variant?: ButtonVariant | 'ghost';
}

/** Internal rendering primitive; its owner resolves defaults and interaction constraints. */
export const ButtonControl = forwardRef<HTMLButtonElement, ButtonControlProps>(
  function ButtonControl(rawProps: ButtonControlProps, ref) {
    const {
      variant = 'outline',
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
      onClick,
      'aria-busy': ariaBusy,
      ...props
    } = rawProps;
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
        onClick={onClick}
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
  },
);
ButtonControl.displayName = 'ButtonControl';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(rawProps, ref) {
  const props = useComponentProps('Button', rawProps);
  return <ButtonControl {...props} ref={ref} />;
});
Button.displayName = 'Button';
