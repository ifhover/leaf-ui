import { useVirtualizer } from '@tanstack/react-virtual';
import type { ReactNode, RefObject } from 'react';
import type { TreeNode } from './tree';

export interface TreeSiblingMeta {
  index: number;
  size: number;
}

export function TreeVirtualNodes({
  visible,
  records,
  siblingMeta,
  scrollElement,
  height,
  itemHeight,
  scrollRef,
  renderNode,
}: {
  visible: readonly TreeNode[];
  records: Map<string, { node: TreeNode; parent?: string; level: number }>;
  siblingMeta: ReadonlyMap<string, TreeSiblingMeta>;
  scrollElement: RefObject<HTMLDivElement | null>;
  height: number;
  itemHeight: number;
  scrollRef: { current: ((index: number) => void) | null };
  renderNode: (
    node: TreeNode,
    level: number,
    index: number,
    siblings: number,
    virtualized?: boolean,
  ) => ReactNode;
}) {
  const virtualizer = useVirtualizer({
    count: visible.length,
    getScrollElement: () => scrollElement.current,
    estimateSize: () => Math.max(24, itemHeight),
    overscan: 5,
    initialRect: { height, width: 400 },
    getItemKey: (index) => visible[index]?.key ?? index,
  });
  scrollRef.current = (index) => virtualizer.scrollToIndex(index, { align: 'auto' });

  return (
    <div style={{ position: 'relative', height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map((row) => {
        const node = visible[row.index];
        if (!node) return null;
        const record = records.get(node.key);
        const meta = siblingMeta.get(node.key);
        return (
          <div
            key={node.key}
            ref={virtualizer.measureElement}
            data-index={row.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start}px)`,
            }}
          >
            {renderNode(node, record?.level ?? 1, meta?.index ?? 0, meta?.size ?? 1, true)}
          </div>
        );
      })}
    </div>
  );
}
