import { Children, type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import { useContentTransition } from '../shared/presence';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** The element the indicator is attached to. Standalone badges are not rendered. */
  children: ReactNode;
  count?: number | string;
  max?: number;
  showZero?: boolean;
  dot?: boolean;
  /** Position of an attached indicator. @default 'outside' */
  placement?: 'outside' | 'inside';
  color?: string;
}

const familyForegrounds: Record<string, string> = {
  primary: 'var(--leaf-color-on-primary)',
  success: 'var(--leaf-color-on-success)',
  danger: 'var(--leaf-color-on-danger)',
  warning: 'var(--leaf-color-on-warning)',
  info: 'var(--leaf-color-on-info)',
};

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
  const family = color?.match(/^var\(--leaf-color-(primary|success|danger|warning|info)\)$/)?.[1];
  // Semantic family colors follow their own on*Color; custom colors use the primary foreground.
  const foreground = (family && familyForegrounds[family]) || 'var(--leaf-color-on-primary)';
  const attached = Children.toArray(children).length > 0;
  const number = useRef<HTMLSpanElement>(null);
  const hasCount = count !== undefined && count !== '' && (count !== 0 || showZero);
  const visible = dot || hasCount;
  const display = typeof count === 'number' && count > max ? `${max}+` : count;
  useContentTransition(number, display ?? '');
  if (!attached) return null;
  return (
    <span
      {...props}
      className={classes('leaf-badge', 'leaf-badge--attached', className)}
      data-placement={placement}
      style={{
        ...(color ? { '--leaf-badge-color': color } : {}),
        ...(color ? { '--leaf-badge-on-color': foreground } : {}),
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
