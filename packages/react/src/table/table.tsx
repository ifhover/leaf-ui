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
import { ButtonControl } from '../button/button';
import { useComponentProps } from '../config-provider/component-defaults';
import { LoadingControl as Loading } from '../loading/loading';
import { ScrollbarControl as Scrollbar } from '../scrollbar/scrollbar';
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

const TableRootControl = forwardRef<HTMLTableElement, TableProps>(function TableRootControl(
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
    ...(pinned === 'start' ? { insetInlineStart: pinOffset } : {}),
    ...(pinned === 'end' ? { insetInlineEnd: pinOffset } : {}),
    ...style,
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

const TableRoot = forwardRef<HTMLTableElement, TableProps>(function TableRoot(rawProps, ref) {
  const props = useComponentProps('Table', rawProps);
  return <TableRootControl {...props} ref={ref} />;
});

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  rawProps: TableRowProps,
  ref,
) {
  const props = useComponentProps('TableRow', rawProps);
  return <TableRowControl {...props} ref={ref} />;
});
TableRow.displayName = 'TableRow';

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  rawProps: TableCellProps,
  ref,
) {
  const props = useComponentProps('TableCell', rawProps);
  return <TableCellControl {...props} ref={ref} />;
});
TableCell.displayName = 'TableCell';

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader(rawProps: HTMLAttributes<HTMLTableSectionElement>, ref) {
  return <TableHeaderControl {...useComponentProps('TableHeader', rawProps)} ref={ref} />;
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody(rawProps: HTMLAttributes<HTMLTableSectionElement>, ref) {
  return <TableBodyControl {...useComponentProps('TableBody', rawProps)} ref={ref} />;
});

export const TableFooter = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableFooter(rawProps: HTMLAttributes<HTMLTableSectionElement>, ref) {
  return <TableFooterControl {...useComponentProps('TableFooter', rawProps)} ref={ref} />;
});

export const TableColumnHeader = forwardRef<HTMLTableCellElement, TableColumnHeaderProps>(
  function TableColumnHeader(rawProps: TableColumnHeaderProps, ref) {
    return (
      <TableColumnHeaderControl {...useComponentProps('TableColumnHeader', rawProps)} ref={ref} />
    );
  },
);

export const TableCaption = forwardRef<
  HTMLTableCaptionElement,
  HTMLAttributes<HTMLTableCaptionElement>
>(function TableCaption(rawProps: HTMLAttributes<HTMLTableCaptionElement>, ref) {
  return <TableCaptionControl {...useComponentProps('TableCaption', rawProps)} ref={ref} />;
});

export function TableEmpty(rawProps: TableStateProps) {
  return <TableEmptyControl {...useComponentProps('TableEmpty', rawProps)} />;
}

export function TableError(rawProps: TableErrorProps) {
  return <TableErrorControl {...useComponentProps('TableError', rawProps)} />;
}

export function TableLoading(rawProps: TableStateProps) {
  return <TableLoadingControl {...useComponentProps('TableLoading', rawProps)} />;
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
