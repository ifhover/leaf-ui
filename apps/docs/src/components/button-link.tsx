import type { ButtonProps } from '@sudden3/leaf-ui';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

/** Keep link semantics while sharing Leaf UI's button styles. */
export function ButtonLink({
  variant = 'solid',
  size = 'md',
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      {...props}
      className={['leaf-button', `leaf-button--${variant}`, `leaf-button--${size}`, className]
        .filter(Boolean)
        .join(' ')}
    >
      {startIcon && (
        <span className="leaf-button__icon" aria-hidden="true">
          {startIcon}
        </span>
      )}
      <span className="leaf-button__label">{children}</span>
      {endIcon && (
        <span className="leaf-button__icon" aria-hidden="true">
          {endIcon}
        </span>
      )}
    </a>
  );
}
