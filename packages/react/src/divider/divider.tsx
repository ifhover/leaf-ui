import type { HTMLAttributes } from 'react';
import { classes } from '../shared/classes';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  type?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  dashed?: boolean;
}
export function Divider({
  type = 'horizontal',
  align = 'center',
  dashed = false,
  children,
  className,
  ...props
}: DividerProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: A labelled divider needs text children, which hr cannot contain.
    <div
      {...props}
      role="separator"
      aria-orientation={type}
      aria-label={props['aria-label'] ?? (typeof children === 'string' ? children : undefined)}
      className={classes(
        'leaf-divider',
        `leaf-divider--${type}`,
        `leaf-divider--${align}`,
        dashed && 'leaf-divider--dashed',
        children != null && 'leaf-divider--text',
        className,
      )}
    >
      {type === 'horizontal' && children != null && (
        <span className="leaf-divider__text">{children}</span>
      )}
    </div>
  );
}
