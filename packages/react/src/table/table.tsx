import { Inbox } from 'lucide-react';
import {
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ButtonControl } from '../button/button';
import { LoadingControl as Loading } from '../loading/loading';
import { ResultControl as Result } from '../result/result';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import type { ControlSize } from '../shared/types';
import { useText } from '../shared/use-text';
import type {
  DataTableCellProps,
  DataTablePresentationProps,
  DataTableRowProps,
} from '../tabletanstack/defaults';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  size?: ControlSize;
  variant?: DataTablePresentationProps['variant'];
  columnDividers?: boolean;
  striped?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  minWidth?: CSSProperties['minWidth'];
  tableLayout?: CSSProperties['tableLayout'];
  tableStyle?: CSSProperties;
  scrollRef?: Ref<HTMLDivElement>;
  loading?: boolean;
}

interface TableRootProps extends TableProps {
  // Only the DataTable adapter opts into automatic pinning overflow presentation.
  pinnedWidth?: number;
}

const PinningOverflowContext = createContext(false);

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

const TableRootControl = forwardRef<HTMLTableElement, TableRootProps>(function TableRootControl(
  {
    size = 'md',
    variant = 'layered',
    columnDividers = false,
    striped = true,
    maxHeight,
    minWidth,
    tableLayout,
    tableStyle,
    scrollRef,
    loading = false,
    pinnedWidth,
    className,
    style,
    children,
    ...props
  }: TableRootProps,
  ref,
) {
  const t = useText();
  const element = useRef<HTMLTableElement>(null);
  const tableRef = useMergedRef(element, ref);
  const viewport = useRef<HTMLDivElement>(null);
  const viewportRef = useMergedRef(viewport, scrollRef);
  const [viewportWidth, setViewportWidth] = useState<number>();
  const pinningOverflow =
    pinnedWidth !== undefined && viewportWidth !== undefined && pinnedWidth > viewportWidth;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [verticalOverflow, setVerticalOverflow] = useState(false);
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
      setViewportWidth(node.clientWidth || undefined);
      setVerticalOverflow(node.scrollHeight > node.clientHeight + 1);
      setScrollEdges((previous) =>
        previous.start === next.start && previous.end === next.end ? previous : next,
      );
    };
    const schedule = () => {
      if (frame === undefined) frame = requestAnimationFrame(update);
    };
    const containWheel = (event: WheelEvent) => {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.shiftKey ||
        Math.abs(event.deltaY) <= Math.abs(event.deltaX)
      )
        return;
      const maximum = node.scrollHeight - node.clientHeight;
      if (maximum <= 1 || (event.deltaY < 0 ? node.scrollTop > 0 : node.scrollTop < maximum - 1))
        return;
      for (const target of event.composedPath()) {
        if (target === node) break;
        if (!(target instanceof Element)) continue;
        const nestedMaximum = target.scrollHeight - target.clientHeight;
        if (
          nestedMaximum > 1 &&
          /^(auto|scroll|overlay)$/.test(getComputedStyle(target).overflowY) &&
          (event.deltaY < 0 ? target.scrollTop > 0 : target.scrollTop < nestedMaximum - 1)
        )
          return;
      }
      event.preventDefault();
    };
    update();
    node.addEventListener('scroll', schedule, { passive: true });
    // Older WebKit cannot contain wheel chaining with CSS; keep native scrolling elsewhere.
    if (typeof CSS === 'undefined' || !CSS.supports?.('overscroll-behavior-y', 'contain'))
      node.addEventListener('wheel', containWheel, { passive: false });
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
      node.removeEventListener('wheel', containWheel);
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const table = element.current;
    if (!table) return;
    const measure = () => {
      setHeaderHeight(table.tHead?.getBoundingClientRect().height ?? 0);
    };
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
  }, []);
  return (
    <div
      className={classes(
        'leaf-table',
        `leaf-table--${size}`,
        variant === 'simple' && 'leaf-table--simple',
        variant !== 'simple' && columnDividers && 'leaf-table--column-dividers',
        striped && 'leaf-table--striped',
        className,
      )}
      style={
        {
          ...style,
          '--leaf-table-header-height': `${headerHeight}px`,
          '--leaf-table-viewport-width':
            viewportWidth === undefined ? undefined : `${viewportWidth}px`,
        } as CSSProperties
      }
      data-loading={loading || undefined}
      data-scroll-start={scrollEdges.start || undefined}
      data-scroll-end={scrollEdges.end || undefined}
      data-vertical-overflow={verticalOverflow || undefined}
      data-pinning-overflow={pinningOverflow || undefined}
    >
      {/* A stationary frame clips the scrolling rows without splitting the native table. */}
      <div className="leaf-table__panel" aria-hidden="true" />
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
          <PinningOverflowContext.Provider value={pinningOverflow}>
            {children}
          </PinningOverflowContext.Provider>
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
  pinningOverflow: boolean,
): CSSProperties {
  return {
    textAlign: align,
    ...style,
    ...(pinned
      ? {
          position: pinningOverflow ? ('relative' as const) : ('sticky' as const),
          insetInlineStart: !pinningOverflow && pinned === 'start' ? pinOffset : 'auto',
          insetInlineEnd: !pinningOverflow && pinned === 'end' ? pinOffset : 'auto',
        }
      : {}),
  };
}

export const TableCellControl = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCellControl(
    { align, pinned, pinOffset = 0, pinEdge, className, style, ...props }: TableCellProps,
    ref,
  ) {
    const pinningOverflow = useContext(PinningOverflowContext);
    return (
      <td
        {...props}
        ref={ref}
        className={classes('leaf-table__cell', className)}
        data-pinned={pinned}
        data-pin-edge={pinEdge || undefined}
        style={cellStyle(style, align, pinned, pinOffset, pinningOverflow)}
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
    const pinningOverflow = useContext(PinningOverflowContext);
    return (
      <th
        {...props}
        ref={ref}
        scope={scope}
        className={classes('leaf-table__cell', 'leaf-table__column-header', className)}
        data-pinned={pinned}
        data-pin-edge={pinEdge || undefined}
        style={cellStyle(style, align, pinned, pinOffset, pinningOverflow)}
      />
    );
  },
);

export function TableEmptyControl({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan} className="leaf-table__state-cell">
        <div className="leaf-table__state-content">
          <div className="leaf-table__state" role="status">
            <Inbox size={28} aria-hidden="true" />
            {children ?? t('common.noData')}
          </div>
        </div>
      </TableCellControl>
    </TableRowControl>
  );
}

export function TableLoadingControl({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan} className="leaf-table__state-cell">
        <div className="leaf-table__state-content">
          <div className="leaf-table__state">
            <Loading tip={children ?? t('common.loading')} />
          </div>
        </div>
      </TableCellControl>
    </TableRowControl>
  );
}

export function TableErrorControl({ colSpan = 1, children, onRetry }: TableErrorProps) {
  const t = useText();
  return (
    <TableRowControl className="leaf-table__state-row">
      <TableCellControl colSpan={colSpan} className="leaf-table__state-cell">
        <div className="leaf-table__state-content">
          <Result
            status="danger"
            size="sm"
            role="alert"
            title={children ?? t('table.loadError')}
            extra={
              onRetry && (
                <ButtonControl size="sm" variant="outline" onClick={onRetry}>
                  {t('common.retry')}
                </ButtonControl>
              )
            }
          />
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
  Empty: TableEmptyControl,
  Loading: TableLoadingControl,
  Error: TableErrorControl,
});
