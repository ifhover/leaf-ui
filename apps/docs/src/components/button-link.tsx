import type { ButtonProps } from '@ifhover/leaf-ui';
import type { AnchorHTMLAttributes } from 'react';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}

/** Keep link semantics while sharing Leaf UI's button styles. */
export function ButtonLink({
  variant = 'solid',
  size = 'md',
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
      {children}
    </a>
  );
}
