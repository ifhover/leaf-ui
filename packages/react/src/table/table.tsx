import { CircleAlert, Inbox } from 'lucide-react';
import {
  type CSSProperties,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type TableHTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '../button';
import { Loading } from '../loading';
import { Scrollbar } from '../scrollbar';
import { classes } from '../shared/classes';
import { useMergedRef } from '../shared/field';
import { inertProps } from '../shared/inert';
import type { ControlSize } from '../shared/types';
import { useText } from '../shared/use-text';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  size?: ControlSize;
  bordered?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  maxHeight?: CSSProperties['maxHeight'];
  minWidth?: CSSProperties['minWidth'];
  tableLayout?: CSSProperties['tableLayout'];
  tableStyle?: CSSProperties;
  scrollRef?: Ref<HTMLDivElement>;
  loading?: boolean;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end';
  pinned?: 'start' | 'end';
  pinOffset?: number;
  pinEdge?: boolean;
}

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

const TableRoot = forwardRef<HTMLTableElement, TableProps>(function TableRoot(
  {
    size = 'md',
    bordered = false,
    striped = false,
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
  const [headerHeight, setHeaderHeight] = useState(0);
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
        bordered && 'leaf-table--bordered',
        striped && 'leaf-table--striped',
        stickyHeader && 'leaf-table--sticky',
        className,
      )}
      style={style}
      data-loading={loading || undefined}
    >
      <Scrollbar
        ref={scrollRef}
        className="leaf-table__scroll-area"
        viewportClassName="leaf-table__viewport"
        contentStyle={{ minWidth }}
        maxHeight={maxHeight}
        verticalOffset={headerHeight}
        orientation="both"
        role="region"
        aria-label={`${props['aria-label'] ?? t('表格', 'Table')} · ${t('滚动区域', 'Scroll area')}`}
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
          <Loading size={size} tip={t('加载中', 'Loading')} />
        </div>
      )}
    </div>
  );
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...props }, ref) {
  return <thead {...props} ref={ref} className={classes('leaf-table__header', className)} />;
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...props }, ref) {
  return <tbody {...props} ref={ref} className={classes('leaf-table__body', className)} />;
});

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter({ className, ...props }, ref) {
  return <tfoot {...props} ref={ref} className={classes('leaf-table__footer', className)} />;
});

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected, className, ...props },
  ref,
) {
  return (
    <tr
      {...props}
      ref={ref}
      className={classes('leaf-table__row', className)}
      data-selected={selected || undefined}
    />
  );
});

function cellStyle(
  style: CSSProperties | undefined,
  align: TableCellProps['align'],
  pinned: TableCellProps['pinned'],
  pinOffset: number,
): CSSProperties {
  return {
    textAlign: align,
    ...(pinned === 'start' ? { insetInlineStart: pinOffset } : {}),
    ...(pinned === 'end' ? { insetInlineEnd: pinOffset } : {}),
    ...style,
  };
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, pinned, pinOffset = 0, pinEdge, className, style, ...props },
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
});

export const TableColumnHeader = forwardRef<HTMLTableCellElement, TableColumnHeaderProps>(
  function TableColumnHeader(
    { align, pinned, pinOffset = 0, pinEdge, className, style, scope = 'col', ...props },
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

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption({ className, ...props }, ref) {
  return <caption {...props} ref={ref} className={classes('leaf-table__caption', className)} />;
});

export function TableEmpty({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRow className="leaf-table__state-row">
      <TableCell colSpan={colSpan}>
        <div className="leaf-table__state" role="status">
          <Inbox size={28} aria-hidden="true" />
          {children ?? t('暂无数据', 'No data')}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TableLoading({ colSpan = 1, children }: TableStateProps) {
  const t = useText();
  return (
    <TableRow className="leaf-table__state-row">
      <TableCell colSpan={colSpan}>
        <div className="leaf-table__state">
          <Loading tip={children ?? t('加载中', 'Loading')} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TableError({ colSpan = 1, children, onRetry }: TableErrorProps) {
  const t = useText();
  return (
    <TableRow className="leaf-table__state-row">
      <TableCell colSpan={colSpan}>
        <div className="leaf-table__state leaf-table__state--error" role="alert">
          <CircleAlert size={28} aria-hidden="true" />
          {children ?? t('加载失败，请重试', 'Unable to load data. Please try again.')}
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              {t('重试', 'Retry')}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  ColumnHeader: TableColumnHeader,
  Cell: TableCell,
  Caption: TableCaption,
  Empty: TableEmpty,
  Loading: TableLoading,
  Error: TableError,
});
