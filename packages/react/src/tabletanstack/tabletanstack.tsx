import { useFormattedText } from '../shared/use-formatted-text';
import type {
  DataTableCellProps,
  DataTablePaginationProps,
  DataTablePresentationProps,
  DataTableRowProps,
} from './defaults';

export type {
  DataTableCellProps,
  DataTablePaginationProps,
  DataTablePresentationProps,
  DataTableRowProps,
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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from 'lucide-react';
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
  useGenericComponentDefaults,
} from '../config-provider/component-defaults';
import { useLeafConfig } from '../config-provider/context';
import { FieldScope } from '../form/form';
import { PaginationControl as Pagination } from '../pagination/pagination';
import { RadioControl as Radio } from '../radio/radio';
import { classes } from '../shared/classes';
import { assignRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import { useText } from '../shared/use-text';
import { TableControl as Table } from '../table/table';
import { useRowMotion } from './row-motion';

export interface DataTableColumnMeta {
  label?: string;
  align?: 'start' | 'center' | 'end';
  cellClassName?: string;
  headerClassName?: string;
}

declare const process: { env: { NODE_ENV?: string } };

const developmentWarnings = new Set<string>();

function warnDevelopment(key: string, message: string) {
  if (typeof process === 'undefined' || process.env.NODE_ENV === 'production') return;
  if (developmentWarnings.has(key)) return;
  developmentWarnings.add(key);
  console.warn(`Leaf UI: ${message}`);
}

function hasSortingModel(table: TanStackTable<unknown>) {
  return Boolean(table.options.getSortedRowModel || table.options.manualSorting);
}

function hasPaginationModel(table: TanStackTable<unknown>) {
  return Boolean(table.options.getPaginationRowModel || table.options.manualPagination);
}

function hasExpansionModel(table: TanStackTable<unknown>) {
  return Boolean(table.options.getExpandedRowModel || table.options.manualExpanding);
}

/** Optional metadata checking without augmenting TanStack's global ColumnMeta. */
export type DataTableColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  meta?: DataTableColumnMeta;
};

export type DataTableRowKey<TData> =
  | {
      [Key in keyof TData]-?: TData[Key] extends string | number ? Key : never;
    }[keyof TData]
  | ((row: TData, index: number) => string | number);

export interface UseDataTableOptions<TData> {
  data: readonly TData[];
  columns: readonly ColumnDef<TData>[];
  rowKey: DataTableRowKey<TData>;
  /** Enables local pagination slicing; false takes precedence over options.manualPagination. */
  localPagination?: boolean;
  options?: Omit<TableOptions<TData>, 'data' | 'columns' | 'getCoreRowModel' | 'getRowId'>;
}

interface DataTableInstanceProps<TData> extends DataTablePresentationProps {
  table: TanStackTable<TData>;
  data?: never;
  columns?: never;
  rowKey?: never;
  options?: never;
  localPagination?: never;

  getRowLabel?: (row: Row<TData>) => string;
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  getRowProps?: (row: Row<TData>) => DataTableRowProps;
  getCellProps?: (cell: Cell<TData, unknown>) => DataTableCellProps;
}

interface DataTableDataProps<TData>
  extends Omit<
      DataTableInstanceProps<TData>,
      'table' | 'data' | 'columns' | 'rowKey' | 'options' | 'localPagination'
    >,
    UseDataTableOptions<TData> {
  table?: never;
}

export type DataTableProps<TData> = DataTableInstanceProps<TData> | DataTableDataProps<TData>;

type DataTableContextValue = Omit<
  DataTableInstanceProps<unknown>,
  keyof HTMLAttributes<HTMLDivElement>
> & {
  id: string;
  label?: string;
  labelledBy?: string;
  expandable: boolean;
};
const DataTableContext = createContext<DataTableContextValue | null>(null);

function useDataTableContext() {
  const value = useContext(DataTableContext);
  if (!value) throw new Error('DataTable parts must be rendered inside DataTable.');
  return value;
}

function DataTableRoot<TData>({
  table,
  toolbar,
  size = 'md',
  variant = 'layered',
  columnDividers,
  striped = true,
  maxHeight,
  minWidth,
  loading = false,
  emptyContent,
  error,
  onRetry,
  selection = false,
  getRowLabel,
  renderExpandedRow,
  getRowProps,
  getCellProps,
  resizable = false,
  virtual = false,
  pagination = true,
  tableRef,
  className,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ...props
}: DataTableInstanceProps<TData>) {
  const id = useId();
  const state = table.getState();
  const paginationAvailable = hasPaginationModel(table as unknown as TanStackTable<unknown>);
  const expansionAvailable = hasExpansionModel(table as unknown as TanStackTable<unknown>);
  const automaticPagination = pagination !== false && paginationAvailable;
  const expandable = expansionAvailable && table.getCanSomeRowsExpand();
  const value: DataTableContextValue = {
    table: table as unknown as TanStackTable<unknown>,
    id,
    label,
    labelledBy,
    size,
    variant,
    columnDividers,
    striped,
    maxHeight: maxHeight ?? (virtual ? 400 : undefined),
    minWidth,
    loading,
    emptyContent,
    error,
    onRetry,
    selection,
    getRowLabel: getRowLabel ? (row) => getRowLabel(row as Row<TData>) : undefined,
    renderExpandedRow: renderExpandedRow
      ? (row) => renderExpandedRow(row as Row<TData>)
      : undefined,
    getRowProps: getRowProps ? (row) => getRowProps(row as Row<TData>) : undefined,
    getCellProps: getCellProps ? (cell) => getCellProps(cell as Cell<TData, unknown>) : undefined,
    resizable,
    virtual,
    pagination,
    tableRef,
    expandable,
  };

  useEffect(() => {
    if (selection !== 'single') return;
    if (table.options.enableMultiRowSelection !== false) {
      warnDevelopment(
        'single-selection-config',
        'DataTable selection="single" works best with enableMultiRowSelection: false on the table instance.',
      );
    }
    const selectedKeys = Object.entries(state.rowSelection)
      .filter(([, selected]) => selected)
      .map(([key]) => key);
    if (selectedKeys.length <= 1) return;
    warnDevelopment(
      'single-selection-state',
      'DataTable selection="single" received multiple selected rows; only the most recently requested key is kept.',
    );
    table.setRowSelection({ [selectedKeys.at(-1) as string]: true });
  }, [selection, state.rowSelection, table]);

  useEffect(() => {
    for (const column of table.getAllLeafColumns()) {
      if (
        typeof column.columnDef.header === 'function' &&
        !(column.columnDef.meta as DataTableColumnMeta | undefined)?.label
      ) {
        warnDevelopment(
          `column-header-label:${column.id}`,
          `DataTable column "${column.id}" uses a function header without meta.label; sorting and resizing controls need a plain-text label.`,
        );
      }
    }
  }, [table]);

  useEffect(() => {
    if (pagination !== false && !paginationAvailable) {
      warnDevelopment(
        'automatic-pagination-capability',
        'Automatic DataTable pagination needs getPaginationRowModel() or manualPagination: true; the footer was not rendered.',
      );
    }
    if (renderExpandedRow && !expansionAvailable) {
      warnDevelopment(
        'automatic-expansion-capability',
        'DataTable renderExpandedRow needs getExpandedRowModel() or manualExpanding: true.',
      );
    }
  }, [pagination, paginationAvailable, expansionAvailable, renderExpandedRow]);

  return (
    <DataTableContext.Provider value={value}>
      <FieldScope>
        <div {...props} className={classes('leaf-data-table', className)}>
          {toolbar != null && toolbar !== false && (
            <DataTableToolbarControl>{toolbar}</DataTableToolbarControl>
          )}
          <DataTableContentControl />
          {automaticPagination && (
            <DataTableFooterControl>
              <DataTablePaginationControl {...(typeof pagination === 'object' ? pagination : {})} />
            </DataTableFooterControl>
          )}
        </div>
      </FieldScope>
    </DataTableContext.Provider>
  );
}

function DataTableToolbarControl({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('leaf-data-table__toolbar', className)} />;
}

function DataTableFooterControl({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classes('leaf-data-table__footer', className)} />;
}

function columnLabel(column: Column<unknown, unknown>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  return (
    meta?.label ??
    (typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id)
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
  const { table, loading } = useDataTableContext();
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
  const { table, selection, loading } = useDataTableContext();
  const t = useText();
  if (selection !== 'multiple')
    return <span className="leaf-table__sr-only">{t('dataTable.selectRows')}</span>;
  const selectable = table.getRowModel().flatRows.filter((row) => row.getCanSelect());
  return (
    <Checkbox
      aria-label={t('dataTable.selectAllRowsOnThisPage')}
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      disabled={loading || !selectable.length}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
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
  stripeIndex = rowIndex,
  ariaRowIndex,
  measureRef,
  collapsed = false,
  animate = false,
  lastVisible = false,
}: {
  row: Row<unknown>;
  rowIndex: number;
  stripeIndex?: number;
  ariaRowIndex?: number;
  measureRef?: (node: HTMLTableRowElement | null) => void;
  collapsed?: boolean;
  animate?: boolean;
  lastVisible?: boolean;
}) {
  const config = useDataTableContext();
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
  const utilityCount = Number(Boolean(selection)) + Number(expandable);
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
      <Table.Row
        {...custom}
        ref={(node) => {
          assignRef(element, node);
          measureRef?.(node);
        }}
        data-index={rowIndex}
        data-row-id={row.id}
        data-striped={stripeIndex % 2 === 1 || undefined}
        data-last-visible={lastVisible || undefined}
        hidden={hidden || undefined}
        aria-hidden={collapsed || undefined}
        {...inertProps(collapsed)}
        aria-rowindex={ariaRowIndex}
        selected={selection ? row.getIsSelected() : custom?.selected}
      >
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
              <ButtonControl
                variant="text"
                size="sm"
                className="leaf-data-table__expand"
                startIcon={<ChevronRight className="leaf-data-table__expand-icon" />}
                aria-label={format(
                  row.getIsExpanded() ? 'dataTable.collapseRow' : 'dataTable.expandRow',
                  { label },
                )}
                aria-expanded={row.getIsExpanded()}
                aria-controls={renderExpandedRow && !row.subRows.length ? detailsId : undefined}
                disabled={loading}
                onClick={row.getToggleExpandedHandler()}
                style={{ marginInlineStart: row.depth * 12 }}
              />
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
              {...props}
              {...pinProps(cell.column)}
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
      </Table.Row>
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
  const { virtual, table, maxHeight } = useDataTableContext();
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

function DataTableContentControl({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const config = useDataTableContext();
  const { table, tableRef, loading, error, emptyContent, onRetry, selection, resizable, virtual } =
    config;
  const t = useText();
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
  const sortingAvailable = hasSortingModel(table);
  const expandable = config.expandable;
  const utilityCount = Number(Boolean(selection)) + Number(expandable);
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
    <div {...props} className={classes('leaf-data-table__content', className)}>
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
        variant={config.variant}
        columnDividers={config.columnDividers}
        striped={config.striped}
        maxHeight={config.maxHeight}
        minWidth={config.minWidth ?? totalWidth}
        pinnedWidth={table.getLeftTotalSize() + table.getRightTotalSize()}
        tableLayout="fixed"
        tableStyle={{ width: `max(100%, ${totalWidth}px)` }}
        loading={loading && Boolean(rows.length) && status !== 'error'}
      >
        <colgroup>
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
          {headers.map((group, groupIndex) => (
            <Table.Row key={group.id} aria-rowindex={virtual ? groupIndex + 1 : undefined}>
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
                  sortingAvailable &&
                  !header.isPlaceholder &&
                  !column.columns.length &&
                  column.getCanSort();
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
                  <Table.ColumnHeader
                    key={header.id}
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
                    <div className="leaf-data-table__heading" data-align={meta?.align}>
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
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          ))}
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
            renderedRows.map(({ row, rowIndex, collapsed, animate }, stripeIndex) => (
              <DataRow
                key={row.id}
                row={row}
                rowIndex={rowIndex}
                stripeIndex={stripeIndex}
                collapsed={collapsed}
                animate={animate}
                lastVisible={!collapsed && row.id === rows.at(-1)?.id}
              />
            ))
          )}
        </Table.Body>
      </Table>
    </div>
  );
}

function DataTablePaginationControl({
  className,
  hasNextPage,
  ...props
}: DataTablePaginationProps) {
  const { table, loading, size } = useDataTableContext();
  const { pageIndex, pageSize } = table.getState().pagination;
  const { direction } = useLeafConfig();
  const t = useText();
  const pages = table.getPageCount();
  if (pages < 0) {
    const navProps = { ...props };
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
    ] as const)
      delete navProps[key];
    return (
      <nav
        {...navProps}
        dir={props.dir ?? direction}
        aria-label={props['aria-label'] ?? t('pagination.label')}
        className={classes('leaf-data-table__pagination', className)}
      >
        <ButtonControl
          size={props.size ?? size}
          variant={props.variant === 'ghost' ? 'text' : (props.variant ?? 'outline')}
          disabled={props.disabled || loading || !table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
        >
          {t('pagination.previousPage')}
        </ButtonControl>
        <span>{pageIndex + 1}</span>
        <ButtonControl
          size={props.size ?? size}
          variant={props.variant === 'ghost' ? 'text' : (props.variant ?? 'outline')}
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

export function useDataTable<TData>({
  data,
  columns,
  rowKey,
  options,
  localPagination,
}: UseDataTableOptions<TData>): TanStackTable<TData> {
  const { direction } = useLeafConfig();
  const records = useMemo(() => [...data], [data]);
  const columnDefinitions = useMemo(() => [...columns], [columns]);
  const localSlicing = localPagination ?? true;
  const manualPagination = localSlicing ? options?.manualPagination : true;
  return useReactTable({
    data: records,
    columns: columnDefinitions,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => Boolean(row.subRows.length),
    columnResizeMode: 'onChange',
    columnResizeDirection: direction,
    ...options,
    enableSorting: options?.enableSorting ?? false,
    // TanStack caches row-model factories; manualPagination bypasses slicing without
    // changing the cached model identity. Keep auto reset independent of that toggle so
    // filtering still returns to page one while local pagination is temporarily off.
    manualPagination,
    autoResetPageIndex:
      options?.autoResetPageIndex ??
      (options?.manualPagination !== true && options?.manualSorting !== true),
    getRowId: (row, index) => {
      const key = typeof rowKey === 'function' ? rowKey(row, index) : row[rowKey];
      if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isFinite(key)))
        throw new Error('DataTable rowKey must resolve to a stable string or number.');
      return String(key);
    },
  });
}

function ManagedDataTable<TData>({
  data,
  columns,
  rowKey,
  options,
  localPagination,
  pagination = true,
  ...props
}: DataTableDataProps<TData>) {
  const table = useDataTable({
    data,
    columns,
    rowKey,
    localPagination: localPagination ?? pagination !== false,
    options: {
      enableMultiRowSelection: props.selection !== 'single',
      getRowCanExpand: (row) => Boolean(props.renderExpandedRow || row.subRows.length),
      ...options,
    },
  });
  return <DataTableRoot {...props} pagination={pagination} table={table} />;
}

function DataTableComponent<TData>(rawProps: DataTableProps<TData>) {
  const merged = mergeComponentProps<DataTableProps<TData>>(
    useGenericComponentDefaults('DataTable'),
    rawProps,
  );
  // Removed options from JavaScript consumers must not leak to the DOM.
  const {
    stickyHeader: _stickyHeader,
    caption: _caption,
    layout: _layout,
    children: _children,
    bordered: _bordered,
    selectAllMode: _selectAllMode,
    columnReordering: _columnReordering,
    onRowReorder: _onRowReorder,
    ...props
  } = merged as typeof merged & {
    stickyHeader?: unknown;
    caption?: unknown;
    layout?: unknown;
    children?: unknown;
    bordered?: unknown;
    selectAllMode?: unknown;
    columnReordering?: unknown;
    onRowReorder?: unknown;
  };
  return props.table ? (
    <DataTableRoot {...(props as DataTableInstanceProps<TData>)} />
  ) : (
    <ManagedDataTable {...(props as DataTableDataProps<TData>)} />
  );
}

export const DataTable = DataTableComponent;
