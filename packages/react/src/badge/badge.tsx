import { Children, type HTMLAttributes, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  count?: number | string;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  /** Position of an attached indicator. @default 'outside' */
  placement?: 'outside' | 'inside';
  color?: string;
}

export function Badge(rawProps: BadgeProps) {
  const {
    count,
    max = 99,
    showZero = false,
    dot = false,
    placement = 'outside',
    color,
    children,
    className,
    style,
    ...props
  } = useComponentProps('Badge', rawProps);
  const attached = Children.toArray(children).length > 0;
  const number = useRef<HTMLSpanElement>(null);
  const hasCount = count !== undefined && count !== '' && (count !== 0 || showZero);
  const visible = dot || hasCount;
  const display = typeof count === 'number' && count > max ? `${max}+` : count;
  useContentTransition(number, display ?? '');
  return (
    <span
      {...props}
      className={classes(
        'leaf-badge',
        attached ? 'leaf-badge--attached' : 'leaf-badge--standalone',
        className,
      )}
      data-placement={placement}
      style={{
        ...(color ? { '--leaf-badge-color': color } : {}),
        ...(color ? { '--leaf-badge-on-color': 'var(--leaf-color-on-primary)' } : {}),
        ...style,
      }}
    >
      {children}
      {visible && (
        <span
          className={classes('leaf-badge__indicator', dot && 'leaf-badge__indicator--dot')}
          role="status"
          aria-label={
            props['aria-label'] ?? (!dot && count !== undefined ? String(count) : undefined)
          }
          title={count === undefined ? undefined : String(count)}
        >
          {!dot && (
            <span ref={number} className="leaf-badge__count">
              {display}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
