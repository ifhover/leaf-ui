import type { CSSProperties, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes } from 'react';
import type { InputProps } from '../input/input';
import type { PaginationProps } from '../pagination/pagination';
import type { ControlSize } from '../shared/types';

export interface DataTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export interface DataTableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end';
}

export interface DataTableVirtualOptions {
  estimateRowHeight?: number;
  overscan?: number;
}

/** Shared presentation props do not depend on TanStack or the caller's row type. */
export interface DataTablePresentationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Explicitly choose the built-in layout or a fully custom composition.
   * Omitting it keeps the legacy behavior where children replace the automatic layout.
   */
  layout?: 'auto' | 'custom';
  /** Custom composition rendered by `layout="custom"`, or implicitly by legacy children. */
  children?: ReactNode;
  /** Content for the toolbar in the automatic layout. */
  toolbar?: ReactNode;
  caption?: ReactNode;
  size?: ControlSize;
  /** Adds body/footer column dividers; short header separators are always shown. */
  columnDividers?: boolean;
  /** @deprecated Use `columnDividers` instead. */
  bordered?: boolean;
  striped?: boolean;
  /** Limits the table viewport; headers always remain fixed above the scrolling content. */
  maxHeight?: CSSProperties['maxHeight'];
  minWidth?: CSSProperties['minWidth'];
  loading?: boolean;
  emptyContent?: ReactNode;
  error?: ReactNode;
  onRetry?: () => void;
  selection?: false | 'single' | 'multiple';
  selectAllMode?: 'page' | 'all';
  resizable?: boolean;
  columnReordering?: boolean;
  virtual?: boolean | DataTableVirtualOptions;
  /** Controls the default pagination UI only; local row slicing is a data/Hook option. */
  pagination?: boolean | DataTablePaginationProps;
  tableRef?: Ref<HTMLTableElement>;
}

export interface DataTableSearchProps
  extends Omit<
    InputProps,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'visibilityToggle'
    | 'visible'
    | 'defaultVisible'
    | 'onVisibleChange'
    | 'visibilityIcon'
  > {
  columnId?: string;
}
export interface DataTableColumnVisibilityProps {
  children?: ReactNode;
  label?: string;
}
export interface DataTablePaginationProps
  extends Omit<
    PaginationProps,
    'total' | 'current' | 'defaultCurrent' | 'pageSize' | 'defaultPageSize' | 'onChange'
  > {
  hasNextPage?: boolean;
}
export interface DataTableContentProps extends HTMLAttributes<HTMLDivElement> {}
