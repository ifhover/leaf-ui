import { Children, Fragment, forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { classes } from '../shared/classes';

export interface SpaceProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg' | number | readonly [number, number];
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  split?: ReactNode;
}
export const Space = forwardRef<HTMLDivElement, SpaceProps>(function Space(
  {
    direction = 'horizontal',
    size = 'md',
    align = 'center',
    wrap = false,
    split,
    className,
    children,
    style,
    ...props
  },
  ref,
) {
  const sizes = { sm: 8, md: 16, lg: 24 };
  const gap =
    typeof size === 'string'
      ? sizes[size]
      : typeof size === 'object'
        ? size.map((v) => `${v}px`).join(' ')
        : size;
  return (
    <div
      {...props}
      ref={ref}
      className={classes('leaf-space', className)}
      style={{
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        alignItems: align,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap,
        ...style,
      }}
    >
      {Children.toArray(children).map((child, index) => (
        <Fragment
          key={typeof child === 'object' && child !== null && 'key' in child ? child.key : index}
        >
          {index > 0 && split != null && (
            <span className="leaf-space__split" aria-hidden="true">
              {split}
            </span>
          )}
          {child}
        </Fragment>
      ))}
    </div>
  );
});
