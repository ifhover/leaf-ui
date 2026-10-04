import type { HTMLAttributes, ReactNode } from 'react';
import type { GridBreakpoint } from '../grid/grid';
import { classes } from '../shared/classes';
import type { LeafThemeStyle } from '../theme';
export interface DescriptionItem {
  key: string;
  label: ReactNode;
  children: ReactNode;
  span?: number;
}
export interface DescriptionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  items: readonly DescriptionItem[];
  title?: ReactNode;
  extra?: ReactNode;
  columns?: number | Partial<Record<GridBreakpoint, number>>;
  layout?: 'horizontal' | 'vertical';
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export function Descriptions({
  items,
  title,
  extra,
  columns = { xs: 1, md: 2, lg: 3 },
  layout = 'horizontal',
  bordered = false,
  size = 'md',
  className,
  style,
  ...props
}: DescriptionsProps) {
  const variables: LeafThemeStyle = { ...style };
  if (typeof columns === 'number') variables['--leaf-descriptions-columns'] = Math.max(1, columns);
  else {
    let last = 1;
    for (const point of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      last = columns[point] ?? last;
      variables[`--leaf-descriptions-columns-${point}`] = Math.max(1, last);
    }
  }
  return (
    <div
      {...props}
      className={classes(
        'leaf-descriptions',
        `leaf-descriptions--${layout}`,
        `leaf-descriptions--${size}`,
        bordered && 'leaf-descriptions--bordered',
        className,
      )}
      style={variables}
    >
      {(title || extra) && (
        <div className="leaf-descriptions__header">
          <h3>{title}</h3>
          {extra}
        </div>
      )}
      <dl className="leaf-descriptions__list">
        {items.map((item) => (
          <div
            key={item.key}
            className="leaf-descriptions__item"
            style={
              {
                '--leaf-descriptions-span': Math.max(1, Math.trunc(item.span ?? 1)),
              } as LeafThemeStyle
            }
          >
            <dt>{item.label}</dt>
            <dd>{item.children}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
