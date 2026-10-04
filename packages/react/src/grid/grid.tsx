import { forwardRef, type HTMLAttributes } from 'react';
import { classes } from '../shared/classes';
import type { LeafThemeStyle } from '../theme';

export type GridBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: number | Partial<Record<GridBreakpoint, number>>;
  gap?: number | string | readonly [number | string, number | string];
  align?: 'start' | 'center' | 'end' | 'stretch';
}
export const Grid = forwardRef<HTMLDivElement, GridProps>(function Grid(
  { columns = 3, gap = 16, align = 'stretch', className, style, ...props },
  ref,
) {
  const variables: LeafThemeStyle = {
    alignItems: align,
    gap:
      typeof gap === 'object'
        ? gap.map((v) => (typeof v === 'number' ? `${v}px` : v)).join(' ')
        : gap,
    ...style,
  };
  if (typeof columns === 'number')
    variables['--leaf-grid-columns'] = Math.max(1, Math.trunc(columns));
  else {
    let last = 1;
    for (const point of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      last = columns[point] ?? last;
      variables[`--leaf-grid-columns-${point}`] = Math.max(1, Math.trunc(last));
    }
  }
  return <div {...props} ref={ref} className={classes('leaf-grid', className)} style={variables} />;
});
export interface RowProps extends Omit<GridProps, 'columns' | 'gap'> {
  gutter?: GridProps['gap'];
}
export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  { gutter = 16, className, style, ...props },
  ref,
) {
  const [vertical, horizontal] = typeof gutter === 'object' ? gutter : [gutter, gutter];
  const unit = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);
  const variables: LeafThemeStyle = {
    '--leaf-row-gutter': unit(horizontal),
    columnGap: 0,
    rowGap: unit(vertical),
    ...style,
  };
  return (
    <Grid
      {...props}
      ref={ref}
      columns={24}
      gap={gutter}
      style={variables}
      className={classes('leaf-row', className)}
    />
  );
});
export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  span?: number;
  offset?: number;
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}
export const Col = forwardRef<HTMLDivElement, ColProps>(function Col(
  { span = 24, offset = 0, xs, sm, md, lg, xl, className, style, ...props },
  ref,
) {
  const variables: LeafThemeStyle = { ...style };
  let last = span;
  for (const [point, value] of Object.entries({ xs, sm, md, lg, xl })) {
    last = value ?? last;
    variables[`--leaf-col-span-${point}`] = Math.min(24, Math.max(1, Math.trunc(last)));
    variables[`--leaf-col-display-${point}`] = last <= 0 ? 'none' : 'block';
  }
  return (
    <>
      {offset > 0 && (
        <div
          aria-hidden="true"
          className="leaf-col leaf-col--offset"
          style={{
            ...variables,
            gridColumnEnd: `span ${Math.min(23, Math.max(1, Math.trunc(offset)))}`,
            flexBasis: `${(Math.min(23, Math.max(1, Math.trunc(offset))) / 24) * 100}%`,
          }}
        />
      )}
      <div {...props} ref={ref} className={classes('leaf-col', className)} style={variables} />
    </>
  );
});
