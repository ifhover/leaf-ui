import { forwardRef, type HTMLAttributes } from 'react';
import { classes } from '../shared/classes';
export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  height?: number | string;
  maxHeight?: number | string;
  orientation?: 'vertical' | 'horizontal' | 'both';
  scrollbar?: 'auto' | 'always' | 'hidden';
}
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    height,
    maxHeight,
    orientation = 'vertical',
    scrollbar = 'auto',
    className,
    style,
    tabIndex = 0,
    ...props
  },
  ref,
) {
  return (
    <div
      {...props}
      ref={ref}
      tabIndex={tabIndex}
      className={classes('leaf-scroll-area', className)}
      data-scrollbar={scrollbar}
      style={{
        height,
        maxHeight,
        overflowX:
          orientation === 'vertical' ? 'hidden' : scrollbar === 'always' ? 'scroll' : 'auto',
        overflowY:
          orientation === 'horizontal' ? 'hidden' : scrollbar === 'always' ? 'scroll' : 'auto',
        ...style,
      }}
    />
  );
});
