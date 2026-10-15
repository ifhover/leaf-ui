import { forwardRef } from 'react';
import { useComponentProps } from '../config-provider/component-defaults';
import type { ScrollbarProps } from '../scrollbar';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
export interface ScrollAreaProps extends ScrollbarProps {}
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  rawProps: ScrollAreaProps,
  ref,
) {
  const {
    orientation = 'vertical',
    className,
    ...props
  } = useComponentProps('ScrollArea', rawProps);
  return (
    <Scrollbar
      {...props}
      ref={ref}
      orientation={orientation}
      className={classes('leaf-scroll-area', className)}
    />
  );
});
