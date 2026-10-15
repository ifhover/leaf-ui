import { type CSSProperties, forwardRef, type HTMLAttributes } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import { classes } from '../shared/classes';

export type FlexGap = number | string;

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  gap?: FlexGap | readonly [FlexGap, FlexGap];
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse';
  inline?: boolean;
}

function gapValue(value: FlexGap) {
  if (typeof value === 'number') return `${value}px`;
  const sizes = { sm: 8, md: 16, lg: 24 };
  if (value === 'sm' || value === 'md' || value === 'lg')
    return `var(--leaf-spacing-${value}, ${sizes[value]}px)`;
  return value;
}

/** Lay out direct children without adding item wrappers. */
export const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex(rawProps: FlexProps, ref) {
  const {
    direction = 'row',
    gap = 0,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    inline = false,
    className,
    style,
    ...props
  } = useComponentProps('Flex', rawProps);
  const layout: CSSProperties = {
    display: inline ? 'inline-flex' : 'flex',
    flexDirection: direction,
    gap: typeof gap === 'object' ? gap.map(gapValue).join(' ') : gapValue(gap),
    alignItems: align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : align,
    justifyContent: justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : justify,
    flexWrap: typeof wrap === 'boolean' ? (wrap ? 'wrap' : 'nowrap') : wrap,
    ...style,
  };
  return <div {...props} ref={ref} className={classes('leaf-flex', className)} style={layout} />;
});
