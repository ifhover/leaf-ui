import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';
import { Skeleton } from '../skeleton';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  bordered?: boolean;
  /** Opt into section dividers and a muted footer surface. */
  divided?: boolean;
  hoverable?: boolean;
  size?: 'sm' | 'md';
}
export function Card({
  title,
  description,
  extra,
  cover,
  footer,
  loading = false,
  bordered = true,
  divided = false,
  hoverable = false,
  size = 'md',
  children,
  className,
  ...props
}: CardProps) {
  const body = useRef<HTMLDivElement>(null);
  useContentTransition(body, loading ? 'loading' : 'content');
  return (
    <div
      {...props}
      aria-busy={loading || undefined}
      className={classes(
        'leaf-card',
        `leaf-card--${size}`,
        bordered && 'leaf-card--bordered',
        divided && 'leaf-card--divided',
        hoverable && 'leaf-card--hoverable',
        className,
      )}
    >
      {cover != null && <div className="leaf-card__cover">{cover}</div>}
      {(title != null || description != null || extra != null) && (
        <div className="leaf-card__header">
          {(title != null || description != null) && (
            <div className="leaf-card__heading">
              {title != null && <h3 className="leaf-card__title">{title}</h3>}
              {description != null && <div className="leaf-card__description">{description}</div>}
            </div>
          )}
          {extra != null && <div className="leaf-card__extra">{extra}</div>}
        </div>
      )}
      <div className="leaf-card__body" ref={body}>
        <Skeleton loading={loading}>{children}</Skeleton>
      </div>
      {footer != null && <div className="leaf-card__footer">{footer}</div>}
    </div>
  );
}
