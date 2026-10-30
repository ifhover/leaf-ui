import type { CSSProperties, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes } from 'react';
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
  /** Content for the toolbar in the automatic layout. */
  toolbar?: ReactNode;
  size?: ControlSize;
  /** Simple uses a square, content-surface header without a frame, shadows or column dividers. */
  variant?: 'layered' | 'simple';
  /** Adds body/footer column dividers in the layered variant; ignored in simple. */
  columnDividers?: boolean;
  /** Alternating row backgrounds in either variant; enabled by default. */
  striped?: boolean;
  /** Limits the table viewport; headers always remain fixed above the scrolling content. */
  maxHeight?: CSSProperties['maxHeight'];
  minWidth?: CSSProperties['minWidth'];
  loading?: boolean;
  emptyContent?: ReactNode;
  error?: ReactNode;
  onRetry?: () => void;
  selection?: false | 'single' | 'multiple';
  resizable?: boolean;
  virtual?: boolean | DataTableVirtualOptions;
  /** Controls the default pagination UI only; local row slicing is a data/Hook option. */
  pagination?: boolean | DataTablePaginationProps;
  tableRef?: Ref<HTMLTableElement>;
}

export interface DataTablePaginationProps
  extends Omit<
    PaginationProps,
    'total' | 'current' | 'defaultCurrent' | 'pageSize' | 'defaultPageSize' | 'onChange'
  > {
  hasNextPage?: boolean;
}
