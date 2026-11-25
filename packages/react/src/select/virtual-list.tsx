import { useVirtualizer } from '@tanstack/react-virtual';
import type { ReactNode, RefObject } from 'react';
import type { SelectOption } from './select';

export interface SelectVirtualRow {
  key: string;
  option?: SelectOption;
  group?: ReactNode;
  index: number;
}

export function SelectVirtualList({
  rows,
  panelRef,
  optionHeight,
  listHeight,
  enabled,
  scrollRef,
  renderOption,
}: {
  rows: readonly SelectVirtualRow[];
  panelRef: RefObject<HTMLDivElement | null>;
  optionHeight: number;
  listHeight: number;
  enabled: boolean;
  scrollRef: { current: ((index: number) => void) | null };
  renderOption: (option: SelectOption, index: number) => ReactNode;
}) {
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => panelRef.current,
    estimateSize: () => Math.max(24, optionHeight),
    overscan: 5,
    getItemKey: (index) => rows[index]?.key ?? index,
    enabled,
    initialRect: { height: listHeight, width: 240 },
  });
  scrollRef.current = (index) => virtualizer.scrollToIndex(index, { align: 'auto' });

  return (
    <div
      style={{
        height: virtualizer.getTotalSize(),
        position: 'relative',
        minWidth: '100%',
      }}
    >
      {virtualizer.getVirtualItems().map((item) => {
        const row = rows[item.index];
        if (!row) return null;
        return (
          <div
            key={row.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${item.start}px)`,
            }}
          >
            {row.option ? (
              renderOption(row.option, row.index)
            ) : (
              <div className="leaf-select__group">{row.group}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
