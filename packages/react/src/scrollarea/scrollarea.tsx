import { forwardRef } from 'react';
import { Scrollbar, type ScrollbarProps } from '../scrollbar';
import { classes } from '../shared/classes';
export interface ScrollAreaProps extends ScrollbarProps {}
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { orientation = 'vertical', className, ...props },
  ref,
) {
  return (
    <Scrollbar
      {...props}
      ref={ref}
      orientation={orientation}
      className={classes('leaf-scroll-area', className)}
    />
  );
});
