import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { InputProps } from '../input/input';
import type { PaginationProps } from '../pagination/pagination';
import type { ControlSize } from '../shared/types';
import type { TableProps } from '../table/table';

export interface DataTableVirtualOptions {
  estimateRowHeight?: number;
  overscan?: number;
}

/** Shared presentation props do not depend on TanStack or the caller's row type. */
export interface DataTablePresentationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
  caption?: ReactNode;
  size?: ControlSize;
  bordered?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  maxHeight?: TableProps['maxHeight'];
  minWidth?: TableProps['minWidth'];
  loading?: boolean;
  emptyContent?: ReactNode;
  error?: ReactNode;
  onRetry?: () => void;
  selection?: false | 'single' | 'multiple';
  selectAllMode?: 'page' | 'all';
  resizable?: boolean;
  columnReordering?: boolean;
  virtual?: boolean | DataTableVirtualOptions;
  pagination?: boolean;
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
