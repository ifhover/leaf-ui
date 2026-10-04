import { Children, forwardRef, type HTMLAttributes } from 'react';
import type { GridBreakpoint } from '../grid/grid';
import { classes } from '../shared/classes';
import type { LeafThemeStyle } from '../theme';
export interface MasonryProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | Partial<Record<GridBreakpoint, number>>;
  gap?: number | string;
}
export const Masonry = forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  { columns = { xs: 1, sm: 2, lg: 3 }, gap = 16, className, children, style, ...props },
  ref,
) {
  const variables: LeafThemeStyle = {
    '--leaf-masonry-gap': typeof gap === 'number' ? `${gap}px` : gap,
    ...style,
  };
  if (typeof columns === 'number') variables['--leaf-masonry-columns'] = Math.max(1, columns);
  else {
    let last = 1;
    for (const point of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      last = columns[point] ?? last;
      variables[`--leaf-masonry-columns-${point}`] = Math.max(1, Math.trunc(last));
    }
  }
  return (
    <div {...props} ref={ref} className={classes('leaf-masonry', className)} style={variables}>
      {Children.toArray(children).map((child, index) => (
        <div
          className="leaf-masonry__item"
          key={typeof child === 'object' && child !== null && 'key' in child ? child.key : index}
        >
          {child}
        </div>
      ))}
    </div>
  );
});
