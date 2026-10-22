import { type HTMLAttributes, type ReactNode, useRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';
import type { FeedbackTypeInput } from '../shared/feedback';
import { useListMotion } from '../shared/motion';
import type { LeafThemeStyle } from '../theme';
export interface TimelineItem {
  key: string;
  label?: ReactNode;
  children: ReactNode;
  dot?: ReactNode;
  color?: 'primary' | FeedbackTypeInput | (string & {});
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: readonly TimelineItem[];
  mode?: 'left' | 'right' | 'alternate';
  reverse?: boolean;
  pending?: ReactNode;
}
export function Timeline(rawProps: TimelineProps) {
  const {
    items,
    mode = 'left',
    reverse = false,
    pending,
    className,
    ...props
  } = useComponentProps('Timeline', rawProps);
  const root = useRef<HTMLOListElement>(null);
  const entries = [...items];
  if (reverse) entries.reverse();
  if (pending != null) entries.push({ key: '__leaf-pending', children: pending });
  useListMotion(
    root,
    JSON.stringify([mode, entries.map((item) => item.key)]),
    '.leaf-timeline__item',
  );
  const colors = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
  };
  return (
    <ol
      {...props}
      ref={root}
      className={classes('leaf-timeline', `leaf-timeline--${mode}`, className)}
    >
      {entries.map((item, index) => {
        const color = item.color === 'error' ? 'danger' : item.color;
        return (
          <li
            key={item.key}
            data-motion-key={item.key}
            className="leaf-timeline__item"
            data-pending={item.key === '__leaf-pending' || undefined}
            data-side={mode === 'right' || (mode === 'alternate' && index % 2) ? 'right' : 'left'}
            style={
              {
                '--leaf-timeline-color':
                  color && color in colors
                    ? `var(--leaf-color-${colors[color as keyof typeof colors]})`
                    : (color ?? 'var(--leaf-color-primary-indicator, var(--leaf-color-primary))'),
              } as LeafThemeStyle
            }
          >
            <div className="leaf-timeline__dot" aria-hidden="true">
              {item.dot}
            </div>
            <div className="leaf-timeline__content">
              {item.label != null && <div className="leaf-timeline__label">{item.label}</div>}
              {item.children}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
