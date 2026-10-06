import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number | string;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  text?: ReactNode;
  color?: string;
}
export function Badge({
  count,
  max = 99,
  showZero = false,
  dot = false,
  status,
  text,
  color,
  children,
  className,
  style,
  ...props
}: BadgeProps) {
  const number = useRef<HTMLSpanElement>(null);
  const hasCount = count !== undefined && count !== '' && (count !== 0 || showZero);
  const visible = dot || status || hasCount;
  const display = typeof count === 'number' && count > max ? `${max}+` : count;
  useContentTransition(number, display ?? '');
  return (
    <span
      {...props}
      className={classes('leaf-badge', children != null && 'leaf-badge--attached', className)}
      data-status={status}
      style={{ ...(color ? { '--leaf-badge-color': color } : {}), ...style }}
    >
      {children}
      {visible && (
        <span
          className={classes(
            'leaf-badge__indicator',
            (dot || status) && 'leaf-badge__indicator--dot',
          )}
          role="status"
          aria-label={
            props['aria-label'] ??
            (typeof text === 'string'
              ? text
              : !dot && count !== undefined
                ? String(count)
                : undefined)
          }
          title={count === undefined ? undefined : String(count)}
        >
          {!dot && !status && (
            <span ref={number} className="leaf-badge__count">
              {display}
            </span>
          )}
        </span>
      )}
      {text != null && <span className="leaf-badge__text">{text}</span>}
    </span>
  );
}
