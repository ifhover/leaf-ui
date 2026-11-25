import { useVirtualizer } from '@tanstack/react-virtual';
import type { ReactNode, RefObject } from 'react';
import type { AutoCompleteOption } from './autocomplete';

export function AutoCompleteVirtualList({
  options,
  panelRef,
  optionHeight,
  listHeight,
  enabled,
  scrollRef,
  renderOption,
}: {
  options: readonly AutoCompleteOption[];
  panelRef: RefObject<HTMLDivElement | null>;
  optionHeight: number;
  listHeight: number;
  enabled: boolean;
  scrollRef: { current: ((index: number) => void) | null };
  renderOption: (option: AutoCompleteOption, index: number) => ReactNode;
}) {
  const virtualizer = useVirtualizer({
    count: options.length,
    getScrollElement: () => panelRef.current,
    estimateSize: () => optionHeight,
    enabled,
    initialRect: { height: listHeight, width: 240 },
    overscan: 5,
  });
  scrollRef.current = (index) => virtualizer.scrollToIndex(index, { align: 'auto' });

  return (
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map((item) => {
        const option = options[item.index];
        if (!option) return null;
        return (
          <div
            key={option.value}
            ref={virtualizer.measureElement}
            data-index={item.index}
            style={{
              position: 'absolute',
              top: 0,
              insetInlineStart: 0,
              width: '100%',
              transform: `translateY(${item.start}px)`,
            }}
          >
            {renderOption(option, item.index)}
          </div>
        );
      })}
    </div>
  );
}
