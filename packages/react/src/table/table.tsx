import { CircleAlert, Inbox } from 'lucide-react';
import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { LoadingControl as Loading } from '../loading/loading';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import type { ControlSize } from '../shared/types';
import { useText } from '../shared/use-text';
import type { DataTableCellProps, DataTableRowProps } from '../tabletanstack/defaults';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  size?: ControlSize;
  columnDividers?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  minWidth?: CSSProperties['minWidth'];
  tableLayout?: CSSProperties['tableLayout'];
  tableStyle?: CSSProperties;
  scrollRef?: Ref<HTMLDivElement>;
  loading?: boolean;
}

export type TableRowProps = DataTableRowProps;
export type TableCellProps = DataTableCellProps & {
  pinned?: 'start' | 'end';
  pinOffset?: number;
  pinEdge?: boolean;
};

export interface TableColumnHeaderProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end';
  pinned?: 'start' | 'end';
  pinOffset?: number;
  pinEdge?: boolean;
}

export interface TableStateProps {
  colSpan?: number;
  children?: ReactNode;
}

export interface TableErrorProps extends TableStateProps {
  onRetry?: () => void;
}

const TableRootControl = forwardRef<HTMLTableElement, TableProps>(function TableRootControl(
  {
    size = 'md',
    columnDividers = false,
    striped = true,
    stickyHeader = true,
    maxHeight,
    minWidth,
    tableLayout,
    tableStyle,
    scrollRef,
    loading = false,
    className,
    style,
    children,
    ...props
  }: TableProps,
  ref,
) {
  const t = useText();
  const element = useRef<HTMLTableElement>(null);
  const tableRef = useMergedRef(element, ref);
  const viewport = useRef<HTMLDivElement>(null);
  const viewportRef = useMergedRef(viewport, scrollRef);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollEdges, setScrollEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const node = viewport.current;
    if (!node) return;
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
      const offset = Math.min(maximum, Math.max(0, Math.abs(node.scrollLeft)));
      const next = {
        start: maximum <= 1 || offset <= 1,
        end: maximum <= 1 || offset >= maximum - 1,
      };
      setScrollEdges((previous) =>
        previous.start === next.start && previous.end === next.end ? previous : next,
      );
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    update();
    node.addEventListener('scroll', schedule, { passive: true });
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            schedule();
          });
    observer?.observe(node);
    if (element.current) observer?.observe(element.current);
    window.addEventListener('resize', schedule);
    return () => {
      node.removeEventListener('scroll', schedule);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const table = element.current;
    if (!table || !stickyHeader) {
      setHeaderHeight(0);
      return;
    }
    const measure = () => setHeaderHeight(table.tHead?.getBoundingClientRect().height ?? 0);
    measure();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(table);
    if (table.tHead) observer?.observe(table.tHead);
    const mutation =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            if (table.tHead) observer?.observe(table.tHead);
            measure();
          });
    mutation?.observe(table, { childList: true });
    return () => {
      observer?.disconnect();
      mutation?.disconnect();
    };
  }, [stickyHeader]);
  return (
    <div
      className={classes(
        'leaf-table',
        `leaf-table--${size}`,
        columnDividers && 'leaf-table--column-dividers',
        striped && 'leaf-table--striped',
        stickyHeader && 'leaf-table--sticky',
        className,
      )}
      style={style}
      data-loading={loading || undefined}
      data-scroll-start={scrollEdges.start || undefined}
      data-scroll-end={scrollEdges.end || undefined}
    >
      <Scrollbar
        ref={viewportRef}
        className="leaf-table__scroll-area"
        viewportClassName="leaf-table__viewport"
        contentStyle={{ minWidth }}
        maxHeight={maxHeight}
        verticalOffset={headerHeight}
        orientation="both"
        role="region"
        aria-label={`${props['aria-label'] ?? t('table.table')} · ${t('table.scrollArea')}`}
        {...inertProps(loading)}
      >
        <table
          {...props}
          ref={tableRef}
          className="leaf-table__table"
          style={{ tableLayout, ...tableStyle }}
          aria-busy={loading || props['aria-busy'] || undefined}
        >
          {children}
        </table>
      </Scrollbar>
      {loading && (
        <div className="leaf-table__overlay">
          <Loading size={size} tip={t('common.loading')} />
        </div>
      )}
    </div>
  );
});

export const TableHeaderControl = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeaderControl(
  { className, ...props }: HTMLAttributes<HTMLTableSectionElement>,
  ref,
) {
  return <thead {...props} ref={ref} className={classes('leaf-table__header', className)} />;
});

export const TableBodyControl = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBodyControl({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>, ref) {
  return <tbody {...props} ref={ref} className={classes('leaf-table__body', className)} />;
});

export const TableFooterControl = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableFooterControl(
  { className, ...props }: HTMLAttributes<HTMLTableSectionElement>,
  ref,
) {
  return <tfoot {...props} ref={ref} className={classes('leaf-table__footer', className)} />;
});

export const TableRowControl = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRowControl({ selected, className, ...props }: TableRowProps, ref) {
    return (
      <tr
        {...props}
        ref={ref}
        className={classes('leaf-table__row', className)}
        data-selected={selected || undefined}
      />
    );
  },
);

function cellStyle(
  style: CSSProperties | undefined,
  align: TableCellProps['align'],
  pinned: TableCellProps['pinned'],
  pinOffset: number,
): CSSProperties {
  return {
    textAlign: align,
    ...style,
    ...(pinned ? { position: 'sticky' as const } : {}),
    ...(pinned === 'start' ? { insetInlineStart: pinOffset } : {}),
    ...(pinned === 'end' ? { insetInlineEnd: pinOffset } : {}),
  };
}

export const TableCellControl = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCellControl(
    { align, pinned, pinOffset = 0, pinEdge, className, style, ...props }: TableCellProps,
    ref,
  ) {
    return (
      <td
        {...props}
        ref={ref}
        className={classes('leaf-table__cell', className)}
        data-pinned={pinned}
        data-pin-edge={pinEdge || undefined}
        style={cellStyle(style, align, pinned, pinOffset)}
      />
    );
  },
);

export const TableColumnHeaderControl = forwardRef<HTMLTableCellElement, TableColumnHeaderProps>(
  function TableColumnHeaderControl(
    {
      align,
      pinned,
      pinOffset = 0,
      pinEdge,
      className,
      style,
      scope = 'col',
      ...props
    }: TableColumnHeaderProps,
    ref,
  ) {
    return (
      <th
        {...props}
        ref={ref}
        scope={scope}
        className={classes('leaf-table__cell', 'leaf-table__column-header', className)}
        data-pinned={pinned}
        data-pin-edge={pinEdge || undefined}
        style={cellStyle(style, align, pinned, pinOffset)}
      />
    );
  },
);

export const TableCaptionControl = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaptionControl(
  { className, ...props }: HTMLAttributes<HTMLTableCaptionElement>,
  ref,
) {
  return <caption {...props} ref={ref} className={classes('leaf-table__caption', className)} />;
});

export function TableEmptyControl({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan}>
        <div className="leaf-table__state" role="status">
          <Inbox size={28} aria-hidden="true" />
          {children ?? t('common.noData')}
        </div>
      </TableCellControl>
    </TableRowControl>
  );
}

export function TableLoadingControl({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan}>
        <div className="leaf-table__state">
          <Loading tip={children ?? t('common.loading')} />
        </div>
      </TableCellControl>
    </TableRowControl>
  );
}

export function TableErrorControl({ colSpan = 1, children, onRetry }: TableErrorProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan}>
        <div className="leaf-table__state leaf-table__state--error" role="alert">
          <CircleAlert size={28} aria-hidden="true" />
          {children ?? t('table.loadError')}
          {onRetry && (
            <ButtonControl size="sm" variant="outline" onClick={onRetry}>
              {t('common.retry')}
            </ButtonControl>
          )}
        </div>
      </TableCellControl>
    </TableRowControl>
  );
}

export const TableControl = Object.assign(TableRootControl, {
  Root: TableRootControl,
  Header: TableHeaderControl,
  Body: TableBodyControl,
  Footer: TableFooterControl,
  Row: TableRowControl,
  ColumnHeader: TableColumnHeaderControl,
  Cell: TableCellControl,
  Caption: TableCaptionControl,
  Empty: TableEmptyControl,
  Loading: TableLoadingControl,
  Error: TableErrorControl,
});
