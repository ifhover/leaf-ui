import type { HTMLAttributes, ReactNode } from 'react';
import { classes } from '../shared/classes';
import type { LeafThemeStyle } from '../theme';
export interface TimelineItem {
  key: string;
  label?: ReactNode;
  children: ReactNode;
  dot?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | (string & {});
}
export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, 'onChange'> {
  items: readonly TimelineItem[];
  mode?: 'left' | 'right' | 'alternate';
  reverse?: boolean;
  pending?: ReactNode;
}
export function Timeline({
  items,
  mode = 'left',
  reverse = false,
  pending,
  className,
  ...props
}: TimelineProps) {
  const entries = [...items];
  if (reverse) entries.reverse();
  if (pending != null) entries.push({ key: '__leaf-pending', children: pending });
  const colors = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'danger',
    info: 'info',
  };
  return (
    <ol {...props} className={classes('leaf-timeline', `leaf-timeline--${mode}`, className)}>
      {entries.map((item, index) => (
        <li
          key={item.key}
          className="leaf-timeline__item"
          data-pending={item.key === '__leaf-pending' || undefined}
          data-side={mode === 'right' || (mode === 'alternate' && index % 2) ? 'right' : 'left'}
          style={
            {
              '--leaf-timeline-color':
                item.color && item.color in colors
                  ? `var(--leaf-color-${colors[item.color as keyof typeof colors]})`
                  : (item.color ?? 'var(--leaf-color-primary)'),
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
      ))}
    </ol>
  );
}
