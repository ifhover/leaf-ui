import { useFormattedText } from '../shared/use-formatted-text';
import type {
  DataTableCellProps,
  DataTableColumnVisibilityProps,
  DataTableContentProps,
  DataTablePaginationProps,
  DataTablePresentationProps,
  DataTableRowProps,
  DataTableSearchProps,
} from './defaults';

export type {
  DataTableCellProps,
  DataTableColumnVisibilityProps,
  DataTableContentProps,
  DataTablePaginationProps,
  DataTablePresentationProps,
  DataTableRowProps,
  DataTableSearchProps,
  DataTableVirtualOptions,
} from './defaults';

import {
  type Cell,
  type Column,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type Row,
  type TableOptions,
  type Table as TanStackTable,
  useReactTable,
} from '@tanstack/react-table';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Columns3, Search } from 'lucide-react';
import {
  createContext,
  Fragment,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { CheckboxControl as Checkbox } from '../checkbox/checkbox';
import {
  mergeComponentProps,
  useComponentProps,
  useGenericComponentDefaults,
} from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope } from '../form/form';
import { InputControl } from '../input/input';
import { PaginationControl as Pagination } from '../pagination/pagination';
import { PopoverControl as Popover } from '../popover/popover';
import { RadioControl as Radio } from '../radio/radio';
import { classes } from '../shared/classes';
import { assignRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import { useText } from '../shared/use-text';
import { TableControl as Table } from '../table/table';
import {
  ReorderColumnHeader,
  ReorderHandle,
  ReorderItems,
  ReorderRow,
  ReorderScope,
} from './reordering';
import { useRowMotion } from './row-motion';

export interface DataTableColumnMeta {
  label?: string;
  align?: 'start' | 'center' | 'end';
  cellClassName?: string;
  headerClassName?: string;
}

export interface DataTableRowReorderInfo<TData> {
  rows: readonly Row<TData>[];
  fromIndex: number;
  toIndex: number;
  activeRow: Row<TData>;
  overRow: Row<TData>;
}

export interface DataTableProps<TData> extends DataTablePresentationProps {
  table: TanStackTable<TData>;
  data?: never;
  columns?: never;
  rowKey?: never;
  options?: never;

  getRowLabel?: (row: Row<TData>) => string;
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  getRowProps?: (row: Row<TData>) => DataTableRowProps;
  getCellProps?: (cell: Cell<TData, unknown>) => DataTableCellProps;

  onRowReorder?: (info: DataTableRowReorderInfo<TData>) => void;
}

export interface DataTableDataProps<TData>
  extends Omit<DataTableProps<TData>, 'table' | 'data' | 'columns' | 'rowKey' | 'options'> {
  table?: never;
  data: readonly TData[];
  columns: ColumnDef<TData>[];
  rowKey: keyof TData | ((row: TData, index: number) => string);
  options?: Omit<TableOptions<TData>, 'data' | 'columns' | 'getCoreRowModel' | 'getRowId'>;
}

type DataTableContextValue = Omit<DataTableProps<unknown>, keyof HTMLAttributes<HTMLDivElement>> & {
  id: string;
  label?: string;
  labelledBy?: string;
  expandable: boolean;
  rowReordering: boolean;
  reorderColumns: boolean;
};
const DataTableContext = createContext<DataTableContextValue | null>(null);

function useDataTable() {
  const value = useContext(DataTableContext);
  if (!value) throw new Error('DataTable parts must be rendered inside DataTable.');
  return value;
}

function DataTableRoot<TData>({
  table,
  children,
  caption,
  size = 'md',
  bordered = false,
  striped = true,
  stickyHeader = true,
  maxHeight,
  minWidth,
  loading = false,
  emptyContent,
  error,
  onRetry,
  selection = false,
  selectAllMode = 'page',
  getRowLabel,
  renderExpandedRow,
  getRowProps,
  getCellProps,
  resizable = false,
  columnReordering = false,
  onRowReorder,
  virtual = false,
  pagination = true,
  tableRef,
  className,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...props
}: DataTableProps<TData>) {
  const id = useId();
  const state = table.getState();
  const rows = table.getRowModel().rows;
  const rowReordering = Boolean(
    onRowReorder &&
      !loading &&
      !virtual &&
      !state.sorting.length &&
      !state.columnFilters.length &&
      !state.globalFilter &&
      !state.grouping.length &&
      state.expanded !== true &&
      !Object.values(state.expanded).some(Boolean) &&
      !rows.some((row) => row.depth || row.subRows.length),
  );
  const reorderColumns =
    columnReordering && !loading && table.getAllColumns().every((column) => !column.columns.length);
  const value: DataTableContextValue = {
    table: table as unknown as TanStackTable<unknown>,
    id,
    label,
    labelledBy,
    caption,
    size,
    bordered,
    striped,
    stickyHeader,
    maxHeight: maxHeight ?? (virtual ? 400 : undefined),
    minWidth,
    loading,
    emptyContent,
    error,
    onRetry,
    selection,
    selectAllMode,
    getRowLabel: getRowLabel ? (row) => getRowLabel(row as Row<TData>) : undefined,
    renderExpandedRow: renderExpandedRow
      ? (row) => renderExpandedRow(row as Row<TData>)
      : undefined,
    getRowProps: getRowProps ? (row) => getRowProps(row as Row<TData>) : undefined,
    getCellProps: getCellProps ? (cell) => getCellProps(cell as Cell<TData, unknown>) : undefined,
    resizable,
    columnReordering,
    onRowReorder: onRowReorder
      ? (info) => onRowReorder(info as DataTableRowReorderInfo<TData>)
      : undefined,
    rowReordering,
    reorderColumns,
    virtual,
    pagination,
    tableRef,
    expandable: Boolean(renderExpandedRow) || table.getCanSomeRowsExpand(),
  };
  return (
    <DataTableContext.Provider value={value}>
      <FieldScope>
        <div {...props} className={classes('leaf-data-table', className)}>
          <ReorderScope
            enabled={Boolean(onRowReorder || columnReordering)}
            id={`${id}-reorder`}
            disabled={loading || (!rowReordering && !reorderColumns)}
            onReorder={(kind, activeId, overId) => {
              if (kind === 'row' && rowReordering && onRowReorder) {
                const fromIndex = rows.findIndex((row) => row.id === activeId);
                const toIndex = rows.findIndex((row) => row.id === overId);
                const activeRow = rows[fromIndex];
                const overRow = rows[toIndex];
                if (!activeRow || !overRow) return;
                const next = [...rows];
                next.splice(fromIndex, 1);
                next.splice(toIndex, 0, activeRow);
                onRowReorder({ rows: next, fromIndex, toIndex, activeRow, overRow });
              } else if (kind === 'column' && reorderColumns) {
                const order = table.getAllLeafColumns().map((column) => column.id);
                const fromIndex = order.indexOf(activeId);
                const toIndex = order.indexOf(overId);
                if (fromIndex < 0 || toIndex < 0) return;
                order.splice(fromIndex, 1);
                order.splice(toIndex, 0, activeId);
                table.setColumnOrder(order);
                const pin = table.getColumn(activeId)?.getIsPinned();
                if (pin) {
                  table.setColumnPinning((previous) => {
                    const pinned = [...(previous[pin] ?? [])];
                    const source = pinned.indexOf(activeId);
                    const target = pinned.indexOf(overId);
                    if (source < 0 || target < 0) return previous;
                    pinned.splice(source, 1);
                    pinned.splice(target, 0, activeId);
                    return { ...previous, [pin]: pinned };
                  });
                }
              }
            }}
          >
            {children ?? (
              <>
                <DataTableContentControl />
                {pagination && (
                  <DataTableFooterControl>
                    <DataTablePaginationControl />
                  </DataTableFooterControl>
                )}
              </>
            )}
          </ReorderScope>
        </div>
      </FieldScope>
    </DataTableContext.Provider>
  );
}

export function DataTableToolbar(rawProps: HTMLAttributes<HTMLDivElement>) {
  const { className, ...props } = useComponentProps('DataTableToolbar', rawProps);
  return <div {...props} className={classes('leaf-data-table__toolbar', className)} />;
}

export function DataTableFooterControl({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('leaf-data-table__footer', className)} />;
}

export function DataTableSearch(rawProps: DataTableSearchProps) {
  const { columnId, className, ...props } = useComponentProps('DataTableSearch', rawProps);
  const { table, loading, size } = useDataTable();
  const t = useText();
  const column = columnId ? table.getColumn(columnId) : undefined;
  const value = columnId ? column?.getFilterValue() : table.getState().globalFilter;
  return (
    <InputControl
      aria-label={t('dataTable.searchTable')}
      placeholder={t('dataTable.searchTable')}
      prefix={<Search size={16} />}
      allowClear
      size={size}
      {...props}
      disabled={props.disabled || loading || Boolean(columnId && !column?.getCanFilter())}
      className={classes('leaf-data-table__search', className)}
      value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
      onChange={(event) => {
        if (columnId) column?.setFilterValue(event.currentTarget.value);
        else table.setGlobalFilter(event.currentTarget.value);
      }}
    />
  );
}

function columnLabel(column: Column<unknown, unknown>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  return (
    meta?.label ??
    (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)
  );
}

export function DataTableColumnVisibility(rawProps: DataTableColumnVisibilityProps) {
  const { children, label } = useComponentProps('DataTableColumnVisibility', rawProps);
  const { table, loading, size } = useDataTable();
  const t = useText();
  const title = label ?? t('dataTable.columns');
  return (
    <Popover
      placement="bottom-end"
      aria-label={title}
      content={
        <FieldScope>
          <div className="leaf-data-table__visibility">
            {table.getAllLeafColumns().map((column) => (
              <Checkbox
                key={column.id}
                checked={column.getIsVisible()}
                disabled={loading || !column.getCanHide()}
                onChange={column.getToggleVisibilityHandler()}
              >
                {columnLabel(column)}
              </Checkbox>
            ))}
          </div>
        </FieldScope>
      }
    >
      <ButtonControl
        size={size}
        variant="outline"
        startIcon={<Columns3 size={16} />}
        disabled={loading}
      >
        {children ?? title}
      </ButtonControl>
    </Popover>
  );
}

function pinProps(column: Column<unknown, unknown>) {
  const pin = column.getIsPinned();
  return {
    pinned: pin === 'left' ? ('start' as const) : pin === 'right' ? ('end' as const) : undefined,
    pinOffset:
      pin === 'left'
        ? column.getStart('left')
        : pin === 'right'
          ? column.getAfter('right')
          : undefined,
    pinEdge:
      pin === 'left'
        ? column.getIsLastColumn('left')
        : pin === 'right'
          ? column.getIsFirstColumn('right')
          : undefined,
  };
}

function ResizeHandle({ header }: { header: Header<unknown, unknown> }) {
  const { table, loading } = useDataTable();
  const { direction } = useLeafConfig();
  const format = useFormattedText();
  const column = header.column;
  const min = column.columnDef.minSize ?? 20;
  const max = column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
  return (
    <hr
      tabIndex={loading ? -1 : 0}
      aria-label={format('dataTable.resizeColumn', { label: columnLabel(column) })}
      aria-orientation="vertical"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={column.getSize()}
      aria-disabled={loading || undefined}
      className="leaf-data-table__resize"
      data-resizing={column.getIsResizing() || undefined}
      onMouseDown={loading ? undefined : header.getResizeHandler()}
      onTouchStart={loading ? undefined : header.getResizeHandler()}
      onDoubleClick={() => {
        if (!loading) column.resetSize();
      }}
      onKeyDown={(event) => {
        if (loading || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const step = event.shiftKey ? 50 : 10;
        const delta = (event.key === 'ArrowRight' ? 1 : -1) * (direction === 'rtl' ? -1 : 1) * step;
        const next =
          event.key === 'Home' ? min : event.key === 'End' ? max : column.getSize() + delta;
        table.setColumnSizing((previous) => ({
          ...previous,
          [column.id]: Math.min(max, Math.max(min, next)),
        }));
      }}
    />
  );
}

function SelectionHeader() {
  const { table, selection, selectAllMode, loading } = useDataTable();
  const t = useText();
  if (selection !== 'multiple')
    return <span className="leaf-table__sr-only">{t('dataTable.selectRows')}</span>;
  const page = selectAllMode === 'page';
  const selectable = (
    page ? table.getRowModel() : table.getPrePaginationRowModel()
  ).flatRows.filter((row) => row.getCanSelect());
  return (
    <Checkbox
      aria-label={page ? t('dataTable.selectAllRowsOnThisPage') : t('dataTable.selectAllRows')}
      checked={page ? table.getIsAllPageRowsSelected() : table.getIsAllRowsSelected()}
      indeterminate={page ? table.getIsSomePageRowsSelected() : table.getIsSomeRowsSelected()}
      disabled={loading || !selectable.length}
      onChange={
        page ? table.getToggleAllPageRowsSelectedHandler() : table.getToggleAllRowsSelectedHandler()
      }
    />
  );
}

function MotionCell({ children, ...props }: DataTableCellProps) {
  return (
    <Table.Cell {...props}>
      <div className="leaf-data-table__row-content">{children}</div>
    </Table.Cell>
  );
}

function DataRow({
  row,
  rowIndex,
  ariaRowIndex,
  measureRef,
  collapsed = false,
  animate = false,
  lastVisible = false,
}: {
  row: Row<unknown>;
  rowIndex: number;
  ariaRowIndex?: number;
  measureRef?: (node: HTMLTableRowElement | null) => void;
  collapsed?: boolean;
  animate?: boolean;
  lastVisible?: boolean;
}) {
  const config = useDataTable();
  const { id, selection, loading, getRowLabel, renderExpandedRow, getRowProps, getCellProps } =
    config;
  const format = useFormattedText();
  const detailsId = `${id}-detail-${encodeURIComponent(row.id)}`;
  const label = getRowLabel?.(row) ?? row.id;
  const expandable = config.expandable;
  const detail = Boolean(
    !collapsed && renderExpandedRow && row.getIsExpanded() && !row.subRows.length,
  );
  const [visited, setVisited] = useState(detail);
  useEffect(() => {
    if (detail) setVisited(true);
  }, [detail]);
  const cells = row.getVisibleCells();
  const utilityCount =
    Number(Boolean(selection)) + Number(expandable) + Number(config.rowReordering);
  const custom = getRowProps?.(row);
  const element = useRef<HTMLTableRowElement>(null);
  const hidden = useRowMotion(element, collapsed, animate);
  const Cell = animate ? MotionCell : Table.Cell;
  useEffect(() => {
    const node = element.current;
    const next = node?.nextElementSibling;
    if (!node || !measureRef || !next?.hasAttribute('data-detail-row')) return;
    const measure = () => measureRef(node);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(next);
    return () => observer?.disconnect();
  }, [measureRef]);
  return (
    <Fragment>
      <ReorderRow
        {...custom}
        enabled={Boolean(config.onRowReorder)}
        disabled={!config.rowReordering}
        itemId={row.id}
        itemLabel={label}
        ref={(node) => {
          assignRef(element, node);
          measureRef?.(node);
        }}
        data-index={rowIndex}
        data-row-id={row.id}
        data-last-visible={lastVisible || undefined}
        hidden={hidden || undefined}
        aria-hidden={collapsed || undefined}
        {...inertProps(collapsed)}
        aria-rowindex={ariaRowIndex}
        selected={selection ? row.getIsSelected() : custom?.selected}
      >
        {config.rowReordering && (
          <Cell className="leaf-data-table__utility">
            <ReorderHandle label={format('dataTable.reorderRow', { label })} />
          </Cell>
        )}
        {selection && (
          <Cell className="leaf-data-table__utility">
            {selection === 'single' ? (
              <Radio
                name={`${id}-selection`}
                form={`${id}-detached-selection`}
                aria-label={format('dataTable.selectRow', { label })}
                checked={row.getIsSelected()}
                disabled={loading || !row.getCanSelect()}
                onChange={() => config.table.setRowSelection({ [row.id]: true })}
              />
            ) : (
              <Checkbox
                aria-label={format('dataTable.selectRow', { label })}
                checked={row.getIsSelected()}
                indeterminate={row.getIsSomeSelected()}
                disabled={loading || !row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
              />
            )}
          </Cell>
        )}
        {expandable && (
          <Cell className="leaf-data-table__utility">
            {row.getCanExpand() && (
              <button
                type="button"
                className="leaf-data-table__expand"
                aria-label={format(
                  row.getIsExpanded() ? 'dataTable.collapseRow' : 'dataTable.expandRow',
                  { label },
                )}
                aria-expanded={row.getIsExpanded()}
                aria-controls={renderExpandedRow && !row.subRows.length ? detailsId : undefined}
                disabled={loading}
                onClick={row.getToggleExpandedHandler()}
                style={{ marginInlineStart: row.depth * 12 }}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            )}
          </Cell>
        )}
        {cells.map((cell) => {
          const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
          const props = getCellProps?.(cell);
          if (props?.colSpan === 0 || props?.rowSpan === 0) return null;
          return (
            <Cell
              key={cell.id}
              align={meta?.align}
              {...pinProps(cell.column)}
              {...props}
              className={classes(meta?.cellClassName, props?.className)}
            >
              {cell.getIsPlaceholder()
                ? null
                : flexRender(
                    cell.getIsAggregated()
                      ? (cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell)
                      : cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
              {cell.getIsGrouped() && (
                <span className="leaf-data-table__group-count"> ({row.subRows.length})</span>
              )}
            </Cell>
          );
        })}
      </ReorderRow>
      {renderExpandedRow && row.getCanExpand() && !row.subRows.length && (
        <Table.Row
          className="leaf-data-table__detail"
          id={detailsId}
          data-detail-row={row.id}
          aria-rowindex={ariaRowIndex && detail ? ariaRowIndex + 1 : undefined}
          hidden={!detail}
        >
          <Table.Cell colSpan={Math.max(1, cells.length + utilityCount)}>
            {visited || detail ? renderExpandedRow?.(row) : null}
          </Table.Cell>
        </Table.Row>
      )}
    </Fragment>
  );
}

function VirtualRows({
  rows,
  colSpan,
  headerCount,
  viewport,
  tableElement,
  focusedRowId,
  rowIndexes,
}: {
  rows: Row<unknown>[];
  colSpan: number;
  headerCount: number;
  viewport: RefObject<HTMLDivElement | null>;
  tableElement: RefObject<HTMLTableElement | null>;
  focusedRowId?: string;
  rowIndexes: number[];
}) {
  const { virtual, table, maxHeight } = useDataTable();
  const options = typeof virtual === 'object' ? virtual : {};
  const headerHeight = useRef(headerCount * 44);
  const focusedIndex = focusedRowId ? rows.findIndex((row) => row.id === focusedRowId) : -1;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewport.current,
    estimateSize: () => Math.max(1, options.estimateRowHeight ?? 48),
    overscan: Math.max(1, options.overscan ?? 5),
    getItemKey: (index) => rows[index]?.id ?? index,
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
  const expanded = table.getState().expanded;
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
    if (expanded) virtualizer.measure();
  }, [expanded, virtualizer]);
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
          <Fragment key={row.id}>
            {gap > 0 && (
              <Table.Row className="leaf-data-table__spacer" aria-hidden="true">
                <td colSpan={colSpan} style={{ height: gap }} />
              </Table.Row>
            )}
            <DataRow
              row={row}
              rowIndex={item.index}
              ariaRowIndex={rowIndexes[item.index]}
              measureRef={virtualizer.measureElement}
            />
          </Fragment>
        ) : null;
      })}
      {bottom > 0 && (
        <Table.Row className="leaf-data-table__spacer" aria-hidden="true">
          <td colSpan={colSpan} style={{ height: bottom }} />
        </Table.Row>
      )}
    </>
  );
}

// Retain only collapsed descendants of groups on the current page. Keeping their
// keyed rows also keeps following stripes stable when an odd number of rows closes.
function ordinaryRows(rows: Row<unknown>[]) {
  const immediate = () =>
    rows.map((row, rowIndex) => ({ row, rowIndex, collapsed: false, animate: false }));
  if (rows.length > 200 || !rows.some((row) => row.getIsGrouped())) return immediate();
  const visible = new Set(rows.map((row) => row.id));
  const result: { row: Row<unknown>; rowIndex: number; collapsed: boolean; animate: boolean }[] =
    [];
  function retain(row: Row<unknown>, rowIndex: number, collapsed: boolean): boolean {
    if (result.length >= 200) return false;
    result.push({ row, rowIndex, collapsed, animate: row.depth > 0 });
    if (collapsed || !row.getIsExpanded()) {
      for (const child of row.subRows) {
        if (!visible.has(child.id) && !retain(child, rowIndex, true)) return false;
      }
    }
    return true;
  }
  for (const [rowIndex, row] of rows.entries()) {
    if (!retain(row, rowIndex, false)) return immediate();
  }
  return result;
}

export function DataTableContentControl({ className, ...props }: DataTableContentProps) {
  const config = useDataTable();
  const {
    table,
    caption,
    tableRef,
    loading,
    error,
    emptyContent,
    onRetry,
    selection,
    resizable,
    virtual,
  } = config;
  const t = useText();
  const format = useFormattedText();
  const viewport = useRef<HTMLDivElement>(null);
  const element = useRef<HTMLTableElement>(null);
  const [focusedRowId, setFocusedRowId] = useState<string>();
  const rows = table.getRowModel().rows;
  const columns = [
    ...table.getLeftVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getRightVisibleLeafColumns(),
  ];
  const headers = table.getHeaderGroups();
  const expandable = config.expandable;
  const utilityCount =
    Number(Boolean(selection)) + Number(expandable) + Number(config.rowReordering);
  const colSpan = Math.max(1, columns.length + utilityCount);
  const totalWidth = table.getTotalSize() + utilityCount * 44;
  const lastCenter = table.getCenterVisibleLeafColumns().at(-1)?.id;
  const status =
    error != null && error !== false
      ? 'error'
      : !rows.length || !columns.length
        ? loading
          ? 'loading'
          : 'empty'
        : null;
  const expanded = table.getState().expanded;
  const renderedRows = useMemo(() => (virtual ? [] : ordinaryRows(rows)), [virtual, rows]);
  const virtualRows = useMemo(() => {
    if (!virtual) return { indexes: [], count: 0 };
    let count = headers.length;
    const indexes = rows.map((row) => {
      const index = ++count;
      if (expanded && config.renderExpandedRow && row.getIsExpanded() && !row.subRows.length)
        count++;
      return index;
    });
    return { indexes, count };
  }, [virtual, rows, headers.length, expanded, config.renderExpandedRow]);
  return (
    <div {...props} className={className}>
      <Table
        ref={(node) => {
          assignRef(element, node);
          assignRef(tableRef, node);
        }}
        scrollRef={viewport}
        aria-label={config.label}
        aria-labelledby={config.labelledBy}
        aria-busy={loading || undefined}
        aria-rowcount={virtual && !status ? virtualRows.count : undefined}
        size={config.size}
        bordered={config.bordered}
        striped={config.striped}
        stickyHeader={config.stickyHeader}
        maxHeight={config.maxHeight}
        minWidth={config.minWidth ?? totalWidth}
        tableLayout="fixed"
        tableStyle={{ width: `max(100%, ${totalWidth}px)` }}
        loading={loading && Boolean(rows.length) && status !== 'error'}
      >
        {caption != null && <Table.Caption>{caption}</Table.Caption>}
        <colgroup>
          {config.rowReordering && <col style={{ width: 44 }} />}
          {selection && <col style={{ width: 44 }} />}
          {expandable && <col style={{ width: 44 }} />}
          {columns.map((column) => (
            <col
              key={column.id}
              style={{
                width: column.id === lastCenter ? undefined : column.getSize(),
              }}
            />
          ))}
        </colgroup>
        <Table.Header>
          <ReorderItems
            enabled={Boolean(config.columnReordering)}
            kind="column"
            ids={config.columnReordering ? columns.map((column) => column.id) : []}
          >
            {headers.map((group, groupIndex) => (
              <Table.Row key={group.id} aria-rowindex={virtual ? groupIndex + 1 : undefined}>
                {groupIndex === 0 && config.rowReordering && (
                  <Table.ColumnHeader rowSpan={headers.length} className="leaf-data-table__utility">
                    <span className="leaf-table__sr-only">{t('dataTable.reorderRows')}</span>
                  </Table.ColumnHeader>
                )}
                {groupIndex === 0 && selection && (
                  <Table.ColumnHeader rowSpan={headers.length} className="leaf-data-table__utility">
                    <SelectionHeader />
                  </Table.ColumnHeader>
                )}
                {groupIndex === 0 && expandable && (
                  <Table.ColumnHeader rowSpan={headers.length} className="leaf-data-table__utility">
                    <span className="leaf-table__sr-only">{t('dataTable.expandRows')}</span>
                  </Table.ColumnHeader>
                )}
                {group.headers.map((header) => {
                  const column = header.column;
                  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
                  const sorted = column.getIsSorted();
                  const canSort =
                    !header.isPlaceholder && !column.columns.length && column.getCanSort();
                  const SortIcon =
                    sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;
                  const nextSort = column.getNextSortingOrder();
                  const sortLabel =
                    nextSort === 'asc'
                      ? t('dataTable.sortAscending')
                      : nextSort === 'desc'
                        ? t('dataTable.sortDescending')
                        : t('dataTable.clearSorting');
                  return (
                    <ReorderColumnHeader
                      key={header.id}
                      enabled={Boolean(
                        config.columnReordering && !header.isPlaceholder && !column.columns.length,
                      )}
                      disabled={!config.reorderColumns}
                      itemId={column.id}
                      itemLabel={columnLabel(column)}
                      group={column.getIsPinned() || 'center'}
                      colSpan={header.colSpan}
                      scope={header.colSpan > 1 ? 'colgroup' : 'col'}
                      align={meta?.align}
                      className={meta?.headerClassName}
                      {...pinProps(column)}
                      aria-sort={
                        sorted && column.getSortIndex() === 0
                          ? sorted === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <div className="leaf-data-table__heading">
                        {config.reorderColumns && !header.isPlaceholder && (
                          <ReorderHandle
                            label={format('dataTable.reorderColumn', {
                              label: columnLabel(column),
                            })}
                          />
                        )}
                        {header.isPlaceholder ? null : canSort ? (
                          <button
                            type="button"
                            className="leaf-data-table__sort"
                            data-sorted={sorted || undefined}
                            aria-label={`${columnLabel(column)}: ${sortLabel}`}
                            disabled={loading}
                            onClick={column.getToggleSortingHandler()}
                          >
                            <span>{flexRender(column.columnDef.header, header.getContext())}</span>
                            <SortIcon size={14} aria-hidden="true" />
                          </button>
                        ) : (
                          flexRender(column.columnDef.header, header.getContext())
                        )}
                      </div>
                      {resizable &&
                        !header.isPlaceholder &&
                        !column.columns.length &&
                        column.getCanResize() && <ResizeHandle header={header} />}
                    </ReorderColumnHeader>
                  );
                })}
              </Table.Row>
            ))}
          </ReorderItems>
        </Table.Header>
        <Table.Body
          onFocusCapture={
            virtual
              ? (event) =>
                  setFocusedRowId(
                    (event.target as Element)
                      .closest('[data-row-id], [data-detail-row]')
                      ?.getAttribute('data-row-id') ??
                      (event.target as Element)
                        .closest('[data-detail-row]')
                        ?.getAttribute('data-detail-row') ??
                      undefined,
                  )
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
            <Table.Error colSpan={colSpan} onRetry={onRetry}>
              {error}
            </Table.Error>
          ) : status === 'loading' ? (
            <Table.Loading colSpan={colSpan} />
          ) : status === 'empty' ? (
            <Table.Empty colSpan={colSpan}>{emptyContent}</Table.Empty>
          ) : virtual ? (
            <VirtualRows
              rows={rows}
              colSpan={colSpan}
              headerCount={headers.length}
              viewport={viewport}
              tableElement={element}
              focusedRowId={focusedRowId}
              rowIndexes={virtualRows.indexes}
            />
          ) : (
            <ReorderItems
              enabled={Boolean(config.onRowReorder)}
              kind="row"
              ids={config.onRowReorder ? rows.map((row) => row.id) : []}
            >
              {renderedRows.map(({ row, rowIndex, collapsed, animate }) => (
                <DataRow
                  key={row.id}
                  row={row}
                  rowIndex={rowIndex}
                  collapsed={collapsed}
                  animate={animate}
                  lastVisible={!collapsed && row.id === rows.at(-1)?.id}
                />
              ))}
            </ReorderItems>
          )}
        </Table.Body>
      </Table>
    </div>
  );
}

export function DataTablePaginationControl({
  className,
  hasNextPage,
  ...props
}: DataTablePaginationProps) {
  const { table, loading, size } = useDataTable();
  const { pageIndex, pageSize } = table.getState().pagination;
  const t = useText();
  const pages = table.getPageCount();
  if (pages < 0) {
    return (
      <nav
        aria-label={t('pagination.label')}
        className={classes('leaf-data-table__pagination', className)}
      >
        <ButtonControl
          size={props.size ?? size}
          variant={props.variant ?? 'outline'}
          disabled={props.disabled || loading || !table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          {t('pagination.previousPage')}
        </ButtonControl>
        <span>{pageIndex + 1}</span>
        <ButtonControl
          size={props.size ?? size}
          variant={props.variant ?? 'outline'}
          disabled={props.disabled || loading || !(hasNextPage ?? table.getCanNextPage())}
          onClick={() => table.nextPage()}
        >
          {t('pagination.nextPage')}
        </ButtonControl>
      </nav>
    );
  }
  const total =
    table.options.rowCount ??
    (table.options.manualPagination && table.options.pageCount != null
      ? pages * pageSize
      : table.getRowCount());
  return (
    <Pagination
      showSizeChanger
      size={size}
      {...props}
      className={classes('leaf-data-table__pagination', className)}
      total={total}
      current={pageIndex + 1}
      pageSize={pageSize}
      disabled={props.disabled || loading}
      onChange={(page, nextSize) =>
        table.setPagination({ pageIndex: page - 1, pageSize: nextSize })
      }
    />
  );
}

function ManagedDataTable<TData>({
  data,
  columns,
  rowKey,
  options,
  ...props
}: DataTableDataProps<TData>) {
  const { direction } = useLeafConfig();
  const records = useMemo(() => [...data], [data]);
  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: props.pagination === false ? undefined : getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableMultiRowSelection: props.selection !== 'single',
    getRowCanExpand: (row) => Boolean(props.renderExpandedRow || row.subRows.length),
    columnResizeMode: 'onChange',
    columnResizeDirection: direction,
    ...options,
    getRowId: (row, index) => {
      const key = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (typeof key !== 'string' && typeof key !== 'number')
        throw new Error('DataTable rowKey must resolve to a stable string or number.');
      return String(key);
    },
  });
  return <DataTableRoot {...props} table={table} />;
}

function DataTableComponent<TData>(rawProps: DataTableProps<TData> | DataTableDataProps<TData>) {
  const props = mergeComponentProps<DataTableProps<TData> | DataTableDataProps<TData>>(
    useGenericComponentDefaults('DataTable'),
    rawProps,
  );
  return props.table ? (
    <DataTableRoot {...(props as DataTableProps<TData>)} />
  ) : (
    <ManagedDataTable {...(props as DataTableDataProps<TData>)} />
  );
}

export const DataTable = Object.assign(DataTableComponent, {
  Toolbar: DataTableToolbar,
  Search: DataTableSearch,
  ColumnVisibility: DataTableColumnVisibility,
  Content: DataTableContent,
  Footer: DataTableFooter,
  Pagination: DataTablePagination,
});

export function DataTableContent(rawProps: DataTableContentProps) {
  const props = useComponentProps('DataTableContent', rawProps);
  return <DataTableContentControl {...props} />;
}

export function DataTablePagination(rawProps: DataTablePaginationProps) {
  const props = useComponentProps('DataTablePagination', rawProps);
  return <DataTablePaginationControl {...props} />;
}

export function DataTableFooter(rawProps: HTMLAttributes<HTMLDivElement>) {
  const props = useComponentProps('DataTableFooter', rawProps);
  return <DataTableFooterControl {...props} />;
}
