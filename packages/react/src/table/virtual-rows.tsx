import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import { Fragment, type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { TableControl as TableFrame } from './table-frame';
import type { TableVirtualOptions } from './types';

export function VirtualRows<TRow extends { node: { id: string } }>({
  rows,
  colSpan,
  viewport,
  tableElement,
  focusedRowId,
  rowIndexes,
  virtual,
  maxHeight,
  expandedVersion,
  renderRow,
}: {
  rows: readonly TRow[];
  colSpan: number;
  viewport: RefObject<HTMLDivElement | null>;
  tableElement: RefObject<HTMLTableElement | null>;
  focusedRowId?: string;
  rowIndexes: readonly number[];
  virtual: boolean | TableVirtualOptions;
  maxHeight?: number | string;
  expandedVersion: string;
  renderRow: (
    item: TRow,
    rowIndex: number,
    ariaRowIndex: number | undefined,
    measureRef: (node: HTMLTableRowElement | null) => void,
  ) => ReactNode;
}) {
  const options = typeof virtual === 'object' ? virtual : {};
  const headerHeight = useRef(44);
  const focusedIndex = focusedRowId ? rows.findIndex((item) => item.node.id === focusedRowId) : -1;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => Math.max(1, options.estimateRowHeight ?? 48),
    overscan: Math.max(1, options.overscan ?? 5),
    getItemKey: (index) => rows[index]?.node.id ?? index,
    scrollMargin: headerHeight.current,
    initialRect: { width: 0, height: typeof maxHeight === 'number' ? maxHeight : 400 },
    rangeExtractor: (range) => {
      const visible = defaultRangeExtractor(range);
      return focusedIndex < 0
        ? visible
        : [...new Set([...visible, focusedIndex])].sort((first, second) => first - second);
    },
    measureElement: (element) => {
      const detail = element.nextElementSibling;
      return (
        element.getBoundingClientRect().height +
        (detail?.hasAttribute('data-detail-row') ? detail.getBoundingClientRect().height : 0)
      );
    },
  });

  useEffect(() => {
    const header = tableElement.current?.tHead;
    if (!header) return;
    const measure = () => {
      headerHeight.current = header.getBoundingClientRect().height;
      virtualizer.measure();
    };
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(header);
    return () => observer?.disconnect();
  }, [tableElement, virtualizer]);

  useEffect(() => {
    void expandedVersion;
    virtualizer.measure();
  }, [expandedVersion, virtualizer]);

  const items = virtualizer.getVirtualItems();
  const last = items.at(-1);
  const bottom = last
    ? Math.max(0, virtualizer.getTotalSize() - last.end + headerHeight.current)
    : virtualizer.getTotalSize();

  return (
    <>
      {items.map((item, index) => {
        const row = rows[item.index];
        const previous = items[index - 1];
        const gap = Math.max(0, item.start - (previous?.end ?? headerHeight.current));
        return row ? (
          <Fragment key={row.node.id}>
            {gap > 0 && (
              <TableFrame.Row className="leaf-table__spacer" aria-hidden="true">
                <td colSpan={colSpan} style={{ height: gap }} />
              </TableFrame.Row>
            )}
            {renderRow(row, item.index, rowIndexes[item.index], virtualizer.measureElement)}
          </Fragment>
        ) : null;
      })}
      {bottom > 0 && (
        <TableFrame.Row className="leaf-table__spacer" aria-hidden="true">
          <td colSpan={colSpan} style={{ height: bottom }} />
        </TableFrame.Row>
      )}
    </>
  );
}
