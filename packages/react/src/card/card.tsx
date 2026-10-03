import type { HTMLAttributes, ReactNode } from 'react';
import { classes } from '../shared/classes';
import { Skeleton } from '../skeleton';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md';
}
export function Card({
  title,
  extra,
  cover,
  footer,
  loading = false,
  bordered = true,
  hoverable = false,
  size = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      aria-busy={loading || undefined}
      className={classes(
        'leaf-card',
        `leaf-card--${size}`,
        bordered && 'leaf-card--bordered',
        hoverable && 'leaf-card--hoverable',
        className,
      )}
    >
      {cover != null && <div className="leaf-card__cover">{cover}</div>}
      {(title != null || extra != null) && (
        <div className="leaf-card__header">
          {title != null && <h3 className="leaf-card__title">{title}</h3>}
          {extra != null && <div className="leaf-card__extra">{extra}</div>}
        </div>
      )}
      <div className="leaf-card__body">
        <Skeleton loading={loading}>{children}</Skeleton>
      </div>
      {footer != null && <div className="leaf-card__footer">{footer}</div>}
    </div>
  );
}
