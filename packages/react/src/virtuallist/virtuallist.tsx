import { useVirtualizer } from '@tanstack/react-virtual';
import {
  forwardRef,
  type HTMLAttributes,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefAttributes,
  useImperativeHandle,
  useRef,
} from 'react';
import { Result } from '../result';
import { classes } from '../shared/classes';
export interface VirtualListHandle {
  element: HTMLDivElement | null;
  scrollToIndex: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void;
  scrollToOffset: (offset: number) => void;
}
export interface VirtualListProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly T[];
  itemKey: (item: T, index: number) => Key;
  renderItem: (item: T, index: number) => ReactNode;
  height?: number;
  estimateSize?: number | ((item: T, index: number) => number);
  overscan?: number;
  emptyContent?: ReactNode;
  horizontal?: boolean;
}
function VirtualListRoot<T>(
  {
    items,
    itemKey,
    renderItem,
    height = 320,
    estimateSize = 40,
    overscan = 5,
    emptyContent,
    horizontal = false,
    className,
    style,
    ...props
  }: VirtualListProps<T>,
  ref: Ref<VirtualListHandle>,
) {
  const root = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLLIElement>({
    count: items.length,
    getScrollElement: () => root.current,
    estimateSize: (index) =>
      typeof estimateSize === 'number'
        ? Math.max(1, estimateSize)
        : Math.max(1, estimateSize(items[index] as T, index)),
    getItemKey: (index) => itemKey(items[index] as T, index),
    overscan: Math.max(0, overscan),
    horizontal,
    initialRect: { height, width: 640 },
  });
  useImperativeHandle(
    ref,
    () => ({
      element: root.current,
      scrollToIndex: (index, align = 'auto') => virtualizer.scrollToIndex(index, { align }),
      scrollToOffset: (offset) => virtualizer.scrollToOffset(offset),
    }),
    [virtualizer],
  );
  return (
    <div
      {...props}
      ref={root}
      role={props.role}
      tabIndex={props.tabIndex ?? 0}
      className={classes('leaf-virtual-list', className)}
      style={{ height, ...style }}
    >
      {!items.length ? (
        (emptyContent ?? <Result status="empty" />)
      ) : (
        <ul
          className="leaf-virtual-list__canvas"
          style={{
            height: horizontal ? '100%' : virtualizer.getTotalSize(),
            width: horizontal ? virtualizer.getTotalSize() : '100%',
          }}
        >
          {virtualizer.getVirtualItems().map((row) => (
            <li
              key={row.key}
              ref={virtualizer.measureElement}
              data-index={row.index}
              aria-posinset={row.index + 1}
              aria-setsize={items.length}
              className="leaf-virtual-list__item"
              style={{
                top: 0,
                left: 0,
                width: horizontal ? undefined : '100%',
                height: horizontal ? '100%' : undefined,
                transform: `translate${horizontal ? 'X' : 'Y'}(${row.start}px)`,
              }}
            >
              {renderItem(items[row.index] as T, row.index)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
export const VirtualList = forwardRef(VirtualListRoot) as <T>(
  props: VirtualListProps<T> & RefAttributes<VirtualListHandle>,
) => ReactElement;
