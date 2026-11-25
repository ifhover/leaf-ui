import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Fragment,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type RefObject,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ButtonControl, toIconButtonSize } from '../button/button';
import { CheckboxControl as Checkbox } from '../checkbox/checkbox';
import {
  mergeComponentProps,
  useGenericComponentDefaults,
} from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope } from '../form/form';
import { PaginationControl as Pagination } from '../pagination/pagination';
import { RadioControl as Radio } from '../radio/radio';
import { classes } from '../shared/classes';
import { assignRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import { useFormattedText } from '../shared/use-formatted-text';
import { useText } from '../shared/use-text';
import {
  type ColumnPinInfo,
  computePinLayout,
  getColumnLayout,
  type NormalizedColumn,
  normalizeColumns,
  resolveUtilityWidths,
} from './column-sizing';
import { useRowMotion } from './row-motion';
import { type InternalTableCellProps, TableControl as TableFrame } from './table-frame';
import type {
  TableColumn,
  TableExpandable,
  TableKey,
  TablePaginationProps,
  TablePresentationProps,
  TableRowKey,
  TableRowProps,
  TableRowSelection,
  TableSorterState,
  TableVirtualOptions,
} from './types';

export type {
  TableCellProps,
  TableColumn,
  TableExpandable,
  TableHeaderCellProps,
  TableKey,
  TablePaginationProps,
  TablePresentationProps,
  TableRowKey,
  TableRowProps,
  TableRowSelection,
  TableSorterState,
  TableSortOrder,
  TableVirtualOptions,
} from './types';

export interface TableProps<TData = Record<string, unknown>> extends TablePresentationProps {
  /** 表格数据源。 */
  data: readonly TData[];
  /** 列定义数组。 */
  columns: readonly TableColumn<TData>[];
  /** 稳定的行唯一标识字段名或函数。 */
  rowKey: TableRowKey<TData>;
  /** 行选择配置。 */
  rowSelection?: TableRowSelection<TData>;
  /** 展开行与树形子行配置。 */
  expandable?: TableExpandable<TData>;
  /** 受控排序状态。 */
  sort?: TableSorterState | readonly TableSorterState[] | null;
  /** 非受控初始排序状态。 */
  defaultSort?: TableSorterState | readonly TableSorterState[] | null;
  /** 排序变化回调，返回主排序与完整排序列表。 */
  onSortChange?: (sorter: TableSorterState | null, sorters: TableSorterState[]) => void;
  /** 允许按住 Shift 进行多列叠加排序，默认 false。 */
  multiSort?: boolean;
  /** 服务端排序模式；开启后仅维护排序状态，不在本地重排数据。 */
  manualSorting?: boolean;
  /** 服务端分页模式；开启后不在本地切分当前页数据。 */
  manualPagination?: boolean;
  /** 列宽拖拽或键盘调整回调。 */
  onColumnResize?: (columnKey: string, width: number) => void;
  /** 行操作（勾选、展开）的无障碍名称；默认使用解析后的行 key。 */
  getRowLabel?: (record: TData, index: number) => string;
  /** 自定义数据行原生属性、事件或选中样式。 */
  onRow?: (record: TData, index: number) => TableRowProps;
}

declare const process: { env: { NODE_ENV?: string } };

const developmentWarnings = new Set<string>();

function warnDevelopment(key: string, message: string) {
  if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') return;
  if (developmentWarnings.has(key)) return;
  developmentWarnings.add(key);
  console.warn(`Leaf UI: ${message}`);
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MIN_COLUMN_WIDTH = 20;
const DEFAULT_INDENT_SIZE = 16;

interface TreeRowNode<TData> {
  key: TableKey;
  id: string;
  record: TData;
  depth: number;
  index: number;
  children: TreeRowNode<TData>[];
}

interface FlatRowItem<TData> {
  node: TreeRowNode<TData>;
  collapsed: boolean;
  animate: boolean;
}

function resolveRowKeyValue<TData>(
  record: TData,
  index: number,
  rowKey: TableRowKey<TData>,
): TableKey {
  const key =
    typeof rowKey === 'function' ? rowKey(record, index) : (record[rowKey] as unknown as TableKey);
  if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key))) {
    throw new Error('Table rowKey must resolve to a stable string or number.');
  }
  return key;
}

function getCellValue<TData>(record: TData, dataIndex: TableColumn<TData>['dataIndex']): unknown {
  if (dataIndex === undefined) return undefined;
  if (Array.isArray(dataIndex)) {
    let current: unknown = record;
    for (const segment of dataIndex) {
      if (current == null || typeof current !== 'object') return undefined;
      current = (current as Record<string | number, unknown>)[segment];
    }
    return current;
  }
  if (record == null || typeof record !== 'object') return undefined;
  return (record as Record<PropertyKey, unknown>)[dataIndex as PropertyKey];
}

function getColumnLabel<TData>(item: NormalizedColumn<TData>): string {
  if (item.column.label) return item.column.label;
  if (typeof item.column.title === 'string') return item.column.title;
  return item.key;
}

function normalizeSorters(
  value: TableSorterState | readonly TableSorterState[] | null | undefined,
): TableSorterState[] {
  if (!value) return [];
  return Array.isArray(value) ? [...value] : [value as TableSorterState];
}

function compareDefaultValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return 0;
    if (Number.isNaN(a)) return 1;
    if (Number.isNaN(b)) return -1;
    return a - b;
  }
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function sortTreeNodes<TData>(
  nodes: readonly TreeRowNode<TData>[],
  sorters: readonly TableSorterState[],
  columnMap: ReadonlyMap<string, NormalizedColumn<TData>>,
): TreeRowNode<TData>[] {
  if (!sorters.length) return [...nodes];
  const active = sorters
    .map((sorter) => {
      const column = columnMap.get(sorter.columnKey)?.column;
      return column?.sorter ? { sorter, column } : null;
    })
    .filter((item): item is { sorter: TableSorterState; column: TableColumn<TData> } =>
      Boolean(item),
    );
  if (!active.length) return [...nodes];

  const compareNodes = (left: TreeRowNode<TData>, right: TreeRowNode<TData>) => {
    for (const { sorter, column } of active) {
      let result = 0;
      if (typeof column.sorter === 'function') {
        result = column.sorter(left.record, right.record);
      } else {
        result = compareDefaultValues(
          getCellValue(left.record, column.dataIndex),
          getCellValue(right.record, column.dataIndex),
        );
      }
      if (result !== 0) return sorter.order === 'desc' ? -result : result;
    }
    return 0;
  };

  return [...nodes]
    .sort(compareNodes)
    .map((node) =>
      node.children.length
        ? { ...node, children: sortTreeNodes(node.children, sorters, columnMap) }
        : node,
    );
}

function buildTree<TData>(
  data: readonly TData[],
  rowKey: TableRowKey<TData>,
  childrenColumnName: string,
  depth = 0,
  allById = new Map<string, TreeRowNode<TData>>(),
): { roots: TreeRowNode<TData>[]; allById: Map<string, TreeRowNode<TData>>; hasTree: boolean } {
  let hasTree = false;
  const roots = data.map((record, index) => {
    const key = resolveRowKeyValue(record, index, rowKey);
    const id = String(key);
    const rawChildren =
      record != null && typeof record === 'object'
        ? (record as Record<string, unknown>)[childrenColumnName]
        : undefined;
    const childList = Array.isArray(rawChildren) && rawChildren.length > 0 ? rawChildren : null;
    let children: TreeRowNode<TData>[] = [];
    if (childList) {
      hasTree = true;
      children = buildTree(
        childList as TData[],
        rowKey,
        childrenColumnName,
        depth + 1,
        allById,
      ).roots;
    }
    const node: TreeRowNode<TData> = {
      key,
      id,
      record,
      depth,
      index,
      children,
    };
    allById.set(id, node);
    return node;
  });
  return { roots, allById, hasTree };
}

function collectExpandableKeys<TData>(
  nodes: readonly TreeRowNode<TData>[],
  canExpandNode: (node: TreeRowNode<TData>) => boolean,
  keys: TableKey[] = [],
): TableKey[] {
  for (const node of nodes) {
    if (canExpandNode(node)) keys.push(node.key);
    if (node.children.length) collectExpandableKeys(node.children, canExpandNode, keys);
  }
  return keys;
}

function flattenVisibleTree<TData>(
  roots: readonly TreeRowNode<TData>[],
  expandedIds: ReadonlySet<string>,
): FlatRowItem<TData>[] {
  const list: FlatRowItem<TData>[] = [];
  const visit = (nodes: readonly TreeRowNode<TData>[]) => {
    for (const node of nodes) {
      list.push({ node, collapsed: false, animate: false });
      if (node.children.length && expandedIds.has(node.id)) visit(node.children);
    }
  };
  visit(roots);
  return list;
}

/** 非虚拟滚动且节点总数不超过 200 时保留已收起的树形子节点以支持平滑过渡动画与稳定斑马条纹。 */
function flattenAnimatedTree<TData>(
  roots: readonly TreeRowNode<TData>[],
  expandedIds: ReadonlySet<string>,
  hasTree: boolean,
): FlatRowItem<TData>[] {
  if (!hasTree) return roots.map((node) => ({ node, collapsed: false, animate: false }));
  const result: FlatRowItem<TData>[] = [];
  const visit = (nodes: readonly TreeRowNode<TData>[], ancestorCollapsed: boolean): boolean => {
    for (const node of nodes) {
      if (result.length >= 200) return false;
      result.push({
        node,
        collapsed: ancestorCollapsed,
        animate: node.depth > 0,
      });
      if (node.children.length) {
        const childrenCollapsed = ancestorCollapsed || !expandedIds.has(node.id);
        if (!visit(node.children, childrenCollapsed)) return false;
      }
    }
    return true;
  };
  if (!visit(roots, false)) return flattenVisibleTree(roots, expandedIds);
  return result;
}

function SortTriangle({ className, active }: { className: string; active: boolean }) {
  return (
    <svg
      width="10"
      height="5"
      viewBox="0 0 10 5"
      className={className}
      data-active={active || undefined}
      aria-hidden="true"
    >
      <path d="M4.4 1.0 Q5 0.35 5.6 1.0 L8.7 4.1 Q9.15 4.65 8.4 4.65 L1.6 4.65 Q0.85 4.65 1.3 4.1 Z" />
    </svg>
  );
}

function ResizeHandle<TData>({
  item,
  width,
  resizing,
  loading,
  direction,
  onStartResize,
  onKeyboardResize,
  onResetSize,
}: {
  item: NormalizedColumn<TData>;
  width: number;
  resizing: boolean;
  loading: boolean;
  direction: 'ltr' | 'rtl';
  onStartResize: (
    event: ReactMouseEvent<HTMLHRElement> | ReactTouchEvent<HTMLHRElement>,
    columnKey: string,
    startWidth: number,
    min: number,
    max: number,
  ) => void;
  onKeyboardResize: (columnKey: string, nextWidth: number) => void;
  onResetSize: (columnKey: string) => void;
}) {
  const format = useFormattedText();
  const min = item.column.minWidth ?? DEFAULT_MIN_COLUMN_WIDTH;
  const max = item.column.maxWidth ?? Number.MAX_SAFE_INTEGER;
  const roundedWidth = Math.round(width);
  return (
    <hr
      tabIndex={loading ? -1 : 0}
      aria-label={format('table.resizeColumn', { label: getColumnLabel(item) })}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={roundedWidth}
      aria-disabled={loading || undefined}
      className="leaf-table__resize"
      data-resizing={resizing || undefined}
      onMouseDown={loading ? undefined : (event) => onStartResize(event, item.key, width, min, max)}
      onTouchStart={
        loading ? undefined : (event) => onStartResize(event, item.key, width, min, max)
      }
      onDoubleClick={() => {
        if (!loading) onResetSize(item.key);
      }}
      onKeyDown={(event) => {
        if (loading || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const step = event.shiftKey ? 50 : 10;
        const delta = (event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1) * step;
        const next =
          event.key === 'Home' ? min : event.key === 'End' ? max : Math.round(width + delta);
        onKeyboardResize(item.key, Math.min(max, Math.max(min, next)));
      }}
    />
  );
}

function MotionCell({ children, ...props }: InternalTableCellProps) {
  return (
    <TableFrame.Cell {...props}>
      <div className="leaf-table__row-content">{children}</div>
    </TableFrame.Cell>
  );
}

interface DataRowProps<TData> {
  tableId: string;
  item: FlatRowItem<TData>;
  rowIndex: number;
  stripeIndex: number;
  ariaRowIndex?: number;
  measureRef?: (node: HTMLTableRowElement | null) => void;
  columns: readonly NormalizedColumn<TData>[];
  columnPins: ReadonlyMap<string, ColumnPinInfo>;
  selectionPin: ColumnPinInfo;
  expansionPin: ColumnPinInfo;
  sortedColumnKeys: ReadonlySet<string>;
  striped: boolean;
  loading: boolean;
  rowSelection?: TableRowSelection<TData>;
  selectedIds: ReadonlySet<string>;
  onToggleSelect: (node: TreeRowNode<TData>) => void;
  hasExpandColumn: boolean;
  hasInlineTree: boolean;
  indentSize: number;
  expandedIds: ReadonlySet<string>;
  canExpand: boolean;
  canRenderDetail: boolean;
  expandedRowRender?: TableExpandable<TData>['expandedRowRender'];
  onToggleExpand: (node: TreeRowNode<TData>) => void;
  getRowLabel?: (record: TData, index: number) => string;
  onRow?: (record: TData, index: number) => TableRowProps;
}

function DataRow<TData>({
  tableId,
  item,
  rowIndex,
  stripeIndex,
  ariaRowIndex,
  measureRef,
  columns,
  columnPins,
  selectionPin,
  expansionPin,
  sortedColumnKeys,
  striped,
  loading,
  rowSelection,
  selectedIds,
  onToggleSelect,
  hasExpandColumn,
  hasInlineTree,
  indentSize,
  expandedIds,
  canExpand,
  canRenderDetail,
  expandedRowRender,
  onToggleExpand,
  getRowLabel,
  onRow,
}: DataRowProps<TData>) {
  const { node, collapsed, animate } = item;
  const format = useFormattedText();
  const detailsId = `${tableId}-detail-${encodeURIComponent(node.id)}`;
  const label = getRowLabel?.(node.record, node.index) ?? node.id;
  const isExpanded = expandedIds.has(node.id);
  const detailOpen = Boolean(!collapsed && canRenderDetail && isExpanded);
  const [visited, setVisited] = useState(detailOpen);
  useEffect(() => {
    if (detailOpen) setVisited(true);
  }, [detailOpen]);

  const element = useRef<HTMLTableRowElement>(null);
  const hidden = useRowMotion(element, collapsed, animate);
  const Cell = animate ? MotionCell : TableFrame.Cell;

  useEffect(() => {
    const rowEl = element.current;
    if (!rowEl || !measureRef) return;
    const measure = () => measureRef(rowEl);
    const detail = canRenderDetail ? rowEl.nextElementSibling : null;
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    if (detail?.hasAttribute('data-detail-row')) observer?.observe(detail);
    measure();
    return () => observer?.disconnect();
  }, [measureRef, canRenderDetail]);

  const customRow = onRow?.(node.record, node.index);
  const isSelected = rowSelection ? selectedIds.has(node.id) : customRow?.selected;
  const checkboxDisabled = Boolean(
    loading || rowSelection?.getCheckboxProps?.(node.record)?.disabled,
  );
  const selectionType = rowSelection?.type ?? 'checkbox';
  const utilityCount = Number(Boolean(rowSelection)) + Number(hasExpandColumn);

  const renderExpandButton = (inline = false) =>
    canExpand ? (
      <ButtonControl
        variant="text"
        size="icon-sm"
        className={classes('leaf-table__expand', inline && 'leaf-table__tree-expand')}
        aria-label={format(isExpanded ? 'table.collapseRow' : 'table.expandRow', { label })}
        aria-expanded={isExpanded}
        aria-controls={canRenderDetail ? detailsId : undefined}
        disabled={loading}
        onClick={() => onToggleExpand(node)}
        style={
          !inline && node.depth > 0 ? { marginInlineStart: node.depth * indentSize } : undefined
        }
      >
        <ChevronRight className="leaf-table__expand-icon" aria-hidden="true" />
      </ButtonControl>
    ) : null;

  return (
    <Fragment>
      <TableFrame.Row
        {...customRow}
        ref={(el) => {
          assignRef(element, el);
          measureRef?.(el);
        }}
        data-index={rowIndex}
        data-row-id={node.id}
        data-striped={(striped && stripeIndex % 2 === 1) || undefined}
        hidden={hidden || undefined}
        aria-hidden={collapsed || undefined}
        {...inertProps(collapsed)}
        aria-rowindex={ariaRowIndex}
        selected={isSelected}
      >
        {rowSelection && (
          <Cell className="leaf-table__utility leaf-table__selection" {...selectionPin}>
            {selectionType === 'radio' ? (
              <Radio
                name={`${tableId}-selection`}
                form={`${tableId}-detached-selection`}
                aria-label={format('table.selectRow', { label })}
                checked={selectedIds.has(node.id)}
                disabled={checkboxDisabled}
                onChange={() => onToggleSelect(node)}
              />
            ) : (
              <Checkbox
                aria-label={format('table.selectRow', { label })}
                checked={selectedIds.has(node.id)}
                disabled={checkboxDisabled}
                onChange={() => onToggleSelect(node)}
              />
            )}
          </Cell>
        )}
        {hasExpandColumn && (
          <Cell className="leaf-table__utility leaf-table__expansion" {...expansionPin}>
            {renderExpandButton(false)}
          </Cell>
        )}
        {columns.map((colItem, colIndex) => {
          const { column, key } = colItem;
          const customCell = column.onCell?.(node.record, node.index);
          if (customCell?.colSpan === 0 || customCell?.rowSpan === 0) return null;
          const rawValue = getCellValue(node.record, column.dataIndex);
          const rendered: ReactNode = column.render
            ? column.render(rawValue, node.record, node.index)
            : (rawValue as ReactNode);
          const content =
            hasInlineTree && colIndex === 0 ? (
              <div
                className="leaf-table__tree-cell"
                style={node.depth > 0 ? { paddingInlineStart: node.depth * indentSize } : undefined}
              >
                {canExpand ? (
                  renderExpandButton(true)
                ) : (
                  <span className="leaf-table__tree-spacer" aria-hidden="true" />
                )}
                <span className="leaf-table__tree-content">{rendered}</span>
              </div>
            ) : (
              rendered
            );
          return (
            <Cell
              key={key}
              align={column.align}
              {...customCell}
              {...columnPins.get(key)}
              data-sorted={sortedColumnKeys.has(key) || undefined}
              data-ellipsis={column.ellipsis || undefined}
              className={classes(column.className, customCell?.className)}
            >
              {content}
            </Cell>
          );
        })}
      </TableFrame.Row>
      {canRenderDetail && (
        <TableFrame.Row
          className="leaf-table__detail"
          id={detailsId}
          data-detail-row={node.id}
          aria-rowindex={ariaRowIndex && detailOpen ? ariaRowIndex + 1 : undefined}
          hidden={!detailOpen}
        >
          <TableFrame.Cell colSpan={Math.max(1, columns.length + utilityCount)}>
            {visited || detailOpen ? expandedRowRender?.(node.record, node.index) : null}
          </TableFrame.Cell>
        </TableFrame.Row>
      )}
    </Fragment>
  );
}

function VirtualRows<TData>({
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
  rows: readonly FlatRowItem<TData>[];
  colSpan: number;
  viewport: RefObject<HTMLDivElement | null>;
  tableElement: RefObject<HTMLTableElement | null>;
  focusedRowId?: string;
  rowIndexes: readonly number[];
  virtual: boolean | TableVirtualOptions;
  maxHeight?: TableProps<TData>['maxHeight'];
  expandedVersion: string;
  renderRow: (
    item: FlatRowItem<TData>,
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

function TablePaginationBar({
  config,
  tableSize,
  loading,
  total,
  current,
  pageSize,
  onChange,
}: {
  config: TablePaginationProps;
  tableSize: 'sm' | 'md';
  loading: boolean;
  total: number;
  current: number;
  pageSize: number;
  onChange: (page: number, nextSize: number) => void;
}) {
  const { direction } = useLeafConfig();
  const t = useText();
  const {
    className,
    hasNextPage,
    total: _ignoredTotal,
    current: _ignoredCurrent,
    defaultCurrent: _ignoredDefaultCurrent,
    pageSize: _ignoredPageSize,
    defaultPageSize: _ignoredDefaultPageSize,
    onChange: _ignoredOnChange,
    ...rest
  } = config;

  if (total < 0) {
    const navProps = { ...rest };
    for (const key of [
      'showSizeChanger',
      'pageSizeOptions',
      'showQuickJumper',
      'showTotal',
      'simple',
      'disabled',
      'hideOnSinglePage',
      'size',
      'variant',
    ] as const) {
      delete navProps[key];
    }
    return (
      <div className="leaf-table__pagination-bar">
        <nav
          {...navProps}
          dir={rest.dir ?? direction}
          aria-label={rest['aria-label'] ?? t('pagination.label')}
          className={classes('leaf-table__pagination', className)}
        >
          <ButtonControl
            size={toIconButtonSize(rest.size ?? tableSize)}
            variant={rest.variant === 'ghost' ? 'text' : 'outline'}
            className="leaf-pagination__nav"
            aria-label={t('pagination.previousPage')}
            disabled={rest.disabled || loading || current <= 1}
            onClick={() => onChange(Math.max(1, current - 1), pageSize)}
          >
            <ChevronLeft aria-hidden="true" />
          </ButtonControl>
          <span>{current}</span>
          <ButtonControl
            size={toIconButtonSize(rest.size ?? tableSize)}
            variant={rest.variant === 'ghost' ? 'text' : 'outline'}
            className="leaf-pagination__nav"
            aria-label={t('pagination.nextPage')}
            disabled={rest.disabled || loading || hasNextPage === false}
            onClick={() => onChange(current + 1, pageSize)}
          >
            <ChevronRight aria-hidden="true" />
          </ButtonControl>
        </nav>
      </div>
    );
  }

  return (
    <div className="leaf-table__pagination-bar">
      <Pagination
        showSizeChanger
        size={tableSize}
        {...rest}
        className={classes('leaf-table__pagination', className)}
        total={total}
        current={current}
        pageSize={pageSize}
        disabled={rest.disabled || loading}
        onChange={onChange}
      />
    </div>
  );
}

function TableRoot<TData = Record<string, unknown>>({
  data,
  columns: rawColumns,
  rowKey,
  rowSelection,
  expandable,
  sort,
  defaultSort,
  onSortChange,
  multiSort = false,
  manualSorting = false,
  manualPagination,
  onColumnResize,
  getRowLabel,
  onRow,
  size = 'md',
  bordered = false,
  striped = false,
  maxHeight,
  minWidth,
  loading = false,
  emptyContent,
  error,
  onRetry,
  resizable = false,
  virtual = false,
  pagination = true,
  tableRef,
  className,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  dir,
  ...restProps
}: TableProps<TData>) {
  const tableId = useId();
  const { theme, density, direction } = useLeafConfig();
  const effectiveDirection = dir === 'rtl' || dir === 'ltr' ? dir : direction;
  const t = useText();
  const tableSize: 'sm' | 'md' = size === 'sm' ? 'sm' : 'md';
  const effectiveMaxHeight = maxHeight ?? (virtual ? 400 : undefined);

  // 列标准化与无障碍标签开发期提示
  const columns = useMemo(() => normalizeColumns(rawColumns), [rawColumns]);
  const columnMap = useMemo(() => new Map(columns.map((item) => [item.key, item])), [columns]);

  useEffect(() => {
    for (const item of columns) {
      if (
        (item.column.sorter || (resizable && item.column.resizable !== false)) &&
        typeof item.column.title !== 'string' &&
        !item.column.label
      ) {
        warnDevelopment(
          `column-header-label:${item.key}`,
          `Table column "${item.key}" uses a non-string title without label; sorting and resizing controls need a plain-text label.`,
        );
      }
    }
  }, [columns, resizable]);

  // 数据树构建
  const childrenColumnName = String(expandable?.childrenColumnName ?? 'children');
  const { roots, allById, hasTree } = useMemo(
    () => buildTree(data, rowKey, childrenColumnName),
    [data, rowKey, childrenColumnName],
  );

  // 排序状态
  const [internalSorters, setInternalSorters] = useState<TableSorterState[]>(() =>
    normalizeSorters(defaultSort),
  );
  const sorters = sort !== undefined ? normalizeSorters(sort) : internalSorters;
  const sorterMap = useMemo(
    () => new Map(sorters.map((item, index) => [item.columnKey, { order: item.order, index }])),
    [sorters],
  );
  const sortedColumnKeys = useMemo(() => new Set(sorters.map((item) => item.columnKey)), [sorters]);

  // 本地排序
  const sortedRoots = useMemo(
    () => (manualSorting ? roots : sortTreeNodes(roots, sorters, columnMap)),
    [manualSorting, roots, sorters, columnMap],
  );

  // 分页状态与模式判定
  const paginationConfig: TablePaginationProps = typeof pagination === 'object' ? pagination : {};
  const paginationEnabled = pagination !== false;
  const explicitTotal = paginationConfig.total;
  const isManualPagination =
    manualPagination ??
    (explicitTotal !== undefined && (explicitTotal < 0 || explicitTotal > sortedRoots.length));

  const [internalPage, setInternalPage] = useState<number>(() =>
    Math.max(1, Math.floor(paginationConfig.defaultCurrent ?? 1)),
  );
  const [internalPageSize, setInternalPageSize] = useState<number>(() =>
    Math.max(1, Math.floor(paginationConfig.defaultPageSize ?? DEFAULT_PAGE_SIZE)),
  );
  const pageSize = Math.max(1, Math.floor(paginationConfig.pageSize ?? internalPageSize));
  const totalCount = explicitTotal !== undefined ? explicitTotal : sortedRoots.length;
  const totalPages =
    totalCount < 0 ? Number.MAX_SAFE_INTEGER : Math.max(1, Math.ceil(totalCount / pageSize));
  const rawCurrent = Math.max(1, Math.floor(paginationConfig.current ?? internalPage));
  const currentPage =
    paginationConfig.current !== undefined || totalCount < 0
      ? rawCurrent
      : Math.min(rawCurrent, totalPages);

  useEffect(() => {
    if (paginationConfig.current === undefined && totalCount >= 0 && internalPage > totalPages) {
      setInternalPage(totalPages);
    }
  }, [paginationConfig.current, totalCount, internalPage, totalPages]);

  const handlePaginationChange = (nextPage: number, nextSize: number) => {
    if (paginationConfig.current === undefined) setInternalPage(nextPage);
    if (paginationConfig.pageSize === undefined) setInternalPageSize(nextSize);
    paginationConfig.onChange?.(nextPage, nextSize);
  };

  // 当前页顶层数据行
  const pagedRoots = useMemo(() => {
    if (!paginationEnabled || isManualPagination) return sortedRoots;
    const start = (currentPage - 1) * pageSize;
    return sortedRoots.slice(start, start + pageSize);
  }, [paginationEnabled, isManualPagination, sortedRoots, currentPage, pageSize]);

  // 展开状态与树形/详情模式判定
  const hasDetailRenderer = Boolean(expandable?.expandedRowRender);
  const canNodeRenderDetail = (node: TreeRowNode<TData>) => {
    if (!hasDetailRenderer || node.children.length > 0) return false;
    return expandable?.rowExpandable ? expandable.rowExpandable(node.record) : true;
  };
  const canNodeExpand = (node: TreeRowNode<TData>) => {
    if (node.children.length > 0) {
      return expandable?.rowExpandable ? expandable.rowExpandable(node.record) : true;
    }
    return canNodeRenderDetail(node);
  };

  const [internalExpandedKeys, setInternalExpandedKeys] = useState<TableKey[]>(() => {
    if (expandable?.defaultExpandedRowKeys) return [...expandable.defaultExpandedRowKeys];
    if (expandable?.defaultExpandAllRows) return collectExpandableKeys(roots, canNodeExpand);
    return [];
  });
  const expandedKeys = expandable?.expandedRowKeys ?? internalExpandedKeys;
  const expandedIds = useMemo(() => new Set(expandedKeys.map(String)), [expandedKeys]);
  const expandedVersion = useMemo(() => expandedKeys.map(String).join('\u0000'), [expandedKeys]);

  const handleToggleExpand = (node: TreeRowNode<TData>) => {
    const currentlyExpanded = expandedIds.has(node.id);
    const nextKeys = currentlyExpanded
      ? expandedKeys.filter((key) => String(key) !== node.id)
      : [...expandedKeys, node.key];
    if (expandable?.expandedRowKeys === undefined) setInternalExpandedKeys(nextKeys);
    expandable?.onExpand?.(!currentlyExpanded, node.record);
    expandable?.onExpandedRowsChange?.(nextKeys);
  };

  const hasExpandColumn = hasDetailRenderer;
  const hasInlineTree = !hasExpandColumn && hasTree;
  const indentSize = expandable?.indentSize ?? DEFAULT_INDENT_SIZE;

  // 扁平化渲染行列表
  const renderedRows = useMemo(
    () =>
      virtual
        ? flattenVisibleTree(pagedRoots, expandedIds)
        : flattenAnimatedTree(pagedRoots, expandedIds, hasTree),
    [virtual, pagedRoots, expandedIds, hasTree],
  );
  const visibleRows = useMemo(() => renderedRows.filter((item) => !item.collapsed), [renderedRows]);

  // 行选择状态
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<TableKey[]>(() =>
    rowSelection?.defaultSelectedRowKeys ? [...rowSelection.defaultSelectedRowKeys] : [],
  );
  const selectedKeys = rowSelection?.selectedRowKeys ?? internalSelectedKeys;
  const selectionType = rowSelection?.type ?? 'checkbox';
  const normalizedSelectedKeys = useMemo(() => {
    if (selectionType === 'radio' && selectedKeys.length > 1) {
      return [selectedKeys[selectedKeys.length - 1] as TableKey];
    }
    return [...selectedKeys];
  }, [selectionType, selectedKeys]);
  const selectedIds = useMemo(
    () => new Set(normalizedSelectedKeys.map(String)),
    [normalizedSelectedKeys],
  );

  const commitSelection = (nextKeys: TableKey[]) => {
    if (!rowSelection) return;
    const deduped: TableKey[] = [];
    const seen = new Set<string>();
    for (const key of nextKeys) {
      const id = String(key);
      if (seen.has(id)) continue;
      seen.add(id);
      deduped.push(key);
    }
    if (rowSelection.selectedRowKeys === undefined) setInternalSelectedKeys(deduped);
    const nextRows = deduped
      .map((key) => allById.get(String(key))?.record)
      .filter((record): record is TData => record !== undefined);
    rowSelection.onChange?.(deduped, nextRows);
  };

  const handleToggleSelectRow = (node: TreeRowNode<TData>) => {
    if (!rowSelection) return;
    if (selectionType === 'radio') {
      commitSelection([node.key]);
      return;
    }
    const exists = selectedIds.has(node.id);
    const next = exists
      ? normalizedSelectedKeys.filter((key) => String(key) !== node.id)
      : [...normalizedSelectedKeys, node.key];
    commitSelection(next);
  };

  const selectableCurrentPage = useMemo(() => {
    if (!rowSelection || selectionType !== 'checkbox') return [];
    return visibleRows
      .map((item) => item.node)
      .filter((node) => !rowSelection.getCheckboxProps?.(node.record)?.disabled);
  }, [rowSelection, selectionType, visibleRows]);

  const selectedCurrentPageCount = useMemo(
    () => selectableCurrentPage.filter((node) => selectedIds.has(node.id)).length,
    [selectableCurrentPage, selectedIds],
  );
  const allPageSelected =
    selectableCurrentPage.length > 0 && selectedCurrentPageCount === selectableCurrentPage.length;
  const somePageSelected = selectedCurrentPageCount > 0 && !allPageSelected;

  const handleToggleAllPage = () => {
    if (!rowSelection || selectionType !== 'checkbox') return;
    const pageIds = new Set(selectableCurrentPage.map((node) => node.id));
    if (allPageSelected) {
      commitSelection(normalizedSelectedKeys.filter((key) => !pageIds.has(String(key))));
    } else {
      const preserved = normalizedSelectedKeys.filter((key) => !pageIds.has(String(key)));
      commitSelection([...preserved, ...selectableCurrentPage.map((node) => node.key)]);
    }
  };

  // 列宽拖拽状态
  const [resizedWidths, setResizedWidths] = useState<Record<string, number>>({});
  const [resizingKey, setResizingKey] = useState<string | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    },
    [],
  );

  const handleStartResize = (
    event: ReactMouseEvent<HTMLHRElement> | ReactTouchEvent<HTMLHRElement>,
    columnKey: string,
    startWidth: number,
    min: number,
    max: number,
  ) => {
    if ('touches' in event && event.touches.length !== 1) return;
    event.preventDefault();
    resizeCleanupRef.current?.();
    const startX = 'touches' in event ? (event.touches[0]?.clientX ?? 0) : event.clientX;
    const sign = effectiveDirection === 'rtl' ? -1 : 1;
    setResizingKey(columnKey);

    const updateWidth = (clientX: number) => {
      const next = Math.round(Math.min(max, Math.max(min, startWidth + (clientX - startX) * sign)));
      setResizedWidths((previous) =>
        previous[columnKey] === next ? previous : { ...previous, [columnKey]: next },
      );
      onColumnResize?.(columnKey, next);
    };

    const onMouseMove = (moveEvent: MouseEvent) => updateWidth(moveEvent.clientX);
    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches[0]) updateWidth(moveEvent.touches[0].clientX);
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', cleanup);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', cleanup);
      window.removeEventListener('touchcancel', cleanup);
      setResizingKey((current) => (current === columnKey ? null : current));
      if (resizeCleanupRef.current === cleanup) resizeCleanupRef.current = null;
    };

    resizeCleanupRef.current = cleanup;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', cleanup);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', cleanup);
    window.addEventListener('touchcancel', cleanup);
  };

  const handleKeyboardResize = (columnKey: string, nextWidth: number) => {
    setResizedWidths((previous) => ({ ...previous, [columnKey]: nextWidth }));
    onColumnResize?.(columnKey, nextWidth);
  };

  const handleResetSize = (columnKey: string) => {
    setResizedWidths((previous) => {
      if (!(columnKey in previous)) return previous;
      const next = { ...previous };
      delete next[columnKey];
      return next;
    });
  };

  // 排序点击切换
  const handleToggleSort = (item: NormalizedColumn<TData>, shiftKey: boolean) => {
    const directions =
      item.column.sortDirections && item.column.sortDirections.length > 0
        ? item.column.sortDirections
        : (['asc', 'desc'] as const);
    const current = sorterMap.get(item.key)?.order ?? null;
    const currentIdx = current ? directions.indexOf(current) : -1;
    const nextOrder =
      currentIdx === -1
        ? directions[0]
        : currentIdx + 1 < directions.length
          ? directions[currentIdx + 1]
          : null;

    let nextSorters: TableSorterState[];
    if (multiSort && shiftKey) {
      const rest = sorters.filter((entry) => entry.columnKey !== item.key);
      nextSorters = nextOrder ? [...rest, { columnKey: item.key, order: nextOrder }] : rest;
    } else {
      nextSorters = nextOrder ? [{ columnKey: item.key, order: nextOrder }] : [];
    }

    if (sort === undefined) setInternalSorters(nextSorters);
    onSortChange?.(nextSorters[0] ?? null, nextSorters);
    if (!manualSorting && !isManualPagination && paginationConfig.current === undefined) {
      setInternalPage(1);
    }
  };

  // 视口宽度测量与列宽 / 固定列偏移计算
  const viewportRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLTableElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [focusedRowId, setFocusedRowId] = useState<string>();

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const content = node.firstElementChild;
    const measure = () => setAvailableWidth(content?.clientWidth ?? node.clientWidth);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(node);
    if (content) observer?.observe(content);
    window.addEventListener('resize', measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const hasStartPin = columns.some((item) => item.pin === 'start');
  const selectionPinned = Boolean(
    rowSelection && (rowSelection.fixed === true || (rowSelection.fixed !== false && hasStartPin)),
  );
  const expansionPinned = Boolean(hasExpandColumn && hasStartPin);
  const { selectionWidth, expansionWidth } = resolveUtilityWidths({
    size: tableSize,
    bordered,
    selection: Boolean(rowSelection),
    expandable: hasExpandColumn,
    theme,
    density,
    direction: effectiveDirection,
  });

  const layout = useMemo(
    () =>
      getColumnLayout(columns, resizedWidths, {
        forceFixed: Boolean(
          resizable ||
            virtual ||
            selectionPinned ||
            expansionPinned ||
            columns.some((item) => item.pin !== undefined),
        ),
        availableWidth,
        utilityWidth: selectionWidth + expansionWidth,
      }),
    [
      columns,
      resizedWidths,
      resizable,
      virtual,
      selectionPinned,
      expansionPinned,
      availableWidth,
      selectionWidth,
      expansionWidth,
    ],
  );

  const pinLayout = useMemo(
    () =>
      computePinLayout(columns, layout.widths, {
        selectionPinned,
        selectionWidth,
        expansionPinned,
        expansionWidth,
      }),
    [columns, layout.widths, selectionPinned, selectionWidth, expansionPinned, expansionWidth],
  );

  const utilityCount = Number(Boolean(rowSelection)) + Number(hasExpandColumn);
  const colSpan = Math.max(1, columns.length + utilityCount);
  const status =
    error != null && error !== false
      ? 'error'
      : !visibleRows.length || !columns.length
        ? loading
          ? 'loading'
          : 'empty'
        : null;

  const rowExpandable = expandable?.rowExpandable;
  const virtualMeta = useMemo(() => {
    if (!virtual) return { indexes: [] as number[], count: 0 };
    let count = 1;
    const indexes = renderedRows.map((item) => {
      const index = ++count;
      const hasDetail =
        hasDetailRenderer &&
        item.node.children.length === 0 &&
        (rowExpandable ? rowExpandable(item.node.record) : true);
      if (hasDetail && expandedIds.has(item.node.id)) count++;
      return index;
    });
    return { indexes, count };
  }, [virtual, renderedRows, expandedIds, hasDetailRenderer, rowExpandable]);

  const renderDataRow = (
    item: FlatRowItem<TData>,
    rowIndex: number,
    stripeIndex: number,
    ariaRowIndex?: number,
    measureRef?: (node: HTMLTableRowElement | null) => void,
  ) => (
    <DataRow
      key={item.node.id}
      tableId={tableId}
      item={item}
      rowIndex={rowIndex}
      stripeIndex={stripeIndex}
      ariaRowIndex={ariaRowIndex}
      measureRef={measureRef}
      columns={columns}
      columnPins={pinLayout.columnPins}
      selectionPin={pinLayout.selectionPin}
      expansionPin={pinLayout.expansionPin}
      sortedColumnKeys={sortedColumnKeys}
      striped={striped}
      loading={loading}
      rowSelection={rowSelection}
      selectedIds={selectedIds}
      onToggleSelect={handleToggleSelectRow}
      hasExpandColumn={hasExpandColumn}
      hasInlineTree={hasInlineTree}
      indentSize={indentSize}
      expandedIds={expandedIds}
      canExpand={canNodeExpand(item.node)}
      canRenderDetail={canNodeRenderDetail(item.node)}
      expandedRowRender={expandable?.expandedRowRender}
      onToggleExpand={handleToggleExpand}
      getRowLabel={getRowLabel}
      onRow={onRow}
    />
  );

  let visibleStripeCursor = 0;

  return (
    <FieldScope>
      <div {...restProps} dir={dir} className={classes('leaf-table-wrapper', className)}>
        <div className="leaf-table__content">
          <TableFrame
            ref={(el) => {
              assignRef(elementRef, el);
              assignRef(tableRef, el);
            }}
            scrollRef={viewportRef}
            aria-label={label}
            aria-labelledby={labelledBy}
            aria-busy={loading || undefined}
            aria-rowcount={virtual && !status ? virtualMeta.count : undefined}
            size={tableSize}
            bordered={bordered}
            striped={striped}
            maxHeight={effectiveMaxHeight}
            minWidth={minWidth}
            pinnedWidth={pinLayout.pinnedWidth || undefined}
            tableLayout={layout.fixed ? 'fixed' : 'auto'}
            tableStyle={
              layout.fixed && columns.length
                ? { width: layout.totalWidth, minWidth: 0 }
                : { width: '100%' }
            }
            loading={loading && Boolean(visibleRows.length) && status !== 'error'}
          >
            <colgroup>
              {rowSelection && (
                <col
                  className="leaf-table__selection-col"
                  style={layout.fixed ? { width: selectionWidth } : undefined}
                />
              )}
              {hasExpandColumn && (
                <col
                  className="leaf-table__expansion-col"
                  style={layout.fixed ? { width: expansionWidth } : undefined}
                />
              )}
              {columns.map((item) => (
                <col
                  key={item.key}
                  style={{
                    width: layout.widths.get(item.key),
                  }}
                />
              ))}
            </colgroup>
            <TableFrame.Header>
              <TableFrame.Row aria-rowindex={virtual ? 1 : undefined}>
                {rowSelection && (
                  <TableFrame.ColumnHeader
                    className="leaf-table__utility leaf-table__selection"
                    {...pinLayout.selectionPin}
                  >
                    {selectionType === 'checkbox' ? (
                      <Checkbox
                        aria-label={t('table.selectAllRowsOnThisPage')}
                        checked={allPageSelected}
                        indeterminate={somePageSelected}
                        disabled={loading || !selectableCurrentPage.length}
                        onChange={handleToggleAllPage}
                      />
                    ) : (
                      <span className="leaf-table__sr-only">{t('table.selectRows')}</span>
                    )}
                  </TableFrame.ColumnHeader>
                )}
                {hasExpandColumn && (
                  <TableFrame.ColumnHeader
                    className="leaf-table__utility leaf-table__expansion"
                    {...pinLayout.expansionPin}
                  >
                    <span className="leaf-table__sr-only">{t('table.expandRows')}</span>
                  </TableFrame.ColumnHeader>
                )}
                {columns.map((item) => {
                  const { column, key } = item;
                  const customHeader = column.onHeaderCell?.(column);
                  const sortInfo = sorterMap.get(key);
                  const sorted = sortInfo?.order ?? false;
                  const canSort = Boolean(column.sorter);
                  const directions =
                    column.sortDirections && column.sortDirections.length > 0
                      ? column.sortDirections
                      : (['asc', 'desc'] as const);
                  const currentIdx = sorted ? directions.indexOf(sorted) : -1;
                  const nextSort =
                    currentIdx === -1
                      ? directions[0]
                      : currentIdx + 1 < directions.length
                        ? directions[currentIdx + 1]
                        : null;
                  const sortLabel =
                    nextSort === 'asc'
                      ? t('table.sortAscending')
                      : nextSort === 'desc'
                        ? t('table.sortDescending')
                        : t('table.clearSorting');
                  const canResize = resizable && column.resizable !== false;
                  const colWidth = layout.widths.get(key) ?? column.width ?? 150;

                  return (
                    <TableFrame.ColumnHeader
                      key={key}
                      align={column.align}
                      {...customHeader}
                      {...pinLayout.columnPins.get(key)}
                      className={classes(column.headerClassName, customHeader?.className)}
                      data-sortable={canSort || undefined}
                      data-sorted={sorted || undefined}
                      aria-sort={
                        sortInfo && sortInfo.index === 0
                          ? sortInfo.order === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <div className="leaf-table__heading" data-align={column.align}>
                        {canSort ? (
                          <button
                            type="button"
                            className="leaf-table__sort"
                            data-sorted={sorted || undefined}
                            aria-label={`${getColumnLabel(item)}: ${sortLabel}`}
                            disabled={loading}
                            onClick={(event) => handleToggleSort(item, event.shiftKey)}
                          >
                            <span>{column.title}</span>
                            <span className="leaf-table__sort-icons" aria-hidden="true">
                              <SortTriangle
                                className="leaf-table__sort-up"
                                active={sorted === 'asc'}
                              />
                              <SortTriangle
                                className="leaf-table__sort-down"
                                active={sorted === 'desc'}
                              />
                            </span>
                          </button>
                        ) : (
                          column.title
                        )}
                      </div>
                      {canResize && (
                        <ResizeHandle
                          item={item}
                          width={colWidth}
                          resizing={resizingKey === key}
                          loading={loading}
                          direction={effectiveDirection}
                          onStartResize={handleStartResize}
                          onKeyboardResize={handleKeyboardResize}
                          onResetSize={handleResetSize}
                        />
                      )}
                    </TableFrame.ColumnHeader>
                  );
                })}
              </TableFrame.Row>
            </TableFrame.Header>
            <TableFrame.Body
              onFocusCapture={
                virtual
                  ? (event) => {
                      const row = (event.target as Element).closest(
                        '[data-row-id], [data-detail-row]',
                      );
                      setFocusedRowId(
                        row?.getAttribute('data-row-id') ??
                          row?.getAttribute('data-detail-row') ??
                          undefined,
                      );
                    }
                  : undefined
              }
              onBlurCapture={
                virtual
                  ? (event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                        setFocusedRowId(undefined);
                    }
                  : undefined
              }
            >
              {status === 'error' ? (
                <TableFrame.Error colSpan={colSpan} onRetry={onRetry}>
                  {error}
                </TableFrame.Error>
              ) : status === 'loading' ? (
                <TableFrame.Loading colSpan={colSpan} />
              ) : status === 'empty' ? (
                <TableFrame.Empty colSpan={colSpan}>{emptyContent}</TableFrame.Empty>
              ) : virtual ? (
                <VirtualRows
                  rows={renderedRows}
                  colSpan={colSpan}
                  viewport={viewportRef}
                  tableElement={elementRef}
                  focusedRowId={focusedRowId}
                  rowIndexes={virtualMeta.indexes}
                  virtual={virtual}
                  maxHeight={effectiveMaxHeight}
                  expandedVersion={expandedVersion}
                  renderRow={(item, rowIndex, ariaRowIndex, measureRef) =>
                    renderDataRow(item, rowIndex, rowIndex, ariaRowIndex, measureRef)
                  }
                />
              ) : (
                renderedRows.map((item, rowIndex) => {
                  const stripeIndex = item.collapsed ? visibleStripeCursor : visibleStripeCursor++;
                  return renderDataRow(item, rowIndex, stripeIndex);
                })
              )}
            </TableFrame.Body>
          </TableFrame>
        </div>
        {paginationEnabled && (
          <TablePaginationBar
            config={paginationConfig}
            tableSize={tableSize}
            loading={loading}
            total={totalCount}
            current={currentPage}
            pageSize={pageSize}
            onChange={handlePaginationChange}
          />
        )}
      </div>
    </FieldScope>
  );
}

function TableComponent<TData = Record<string, unknown>>(rawProps: TableProps<TData>) {
  const merged = mergeComponentProps<TableProps<TData>>(
    useGenericComponentDefaults('Table'),
    rawProps,
  );
  return <TableRoot {...merged} />;
}

export const Table = TableComponent;
