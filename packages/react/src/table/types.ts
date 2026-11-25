import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  Ref,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import type { PaginationProps } from '../pagination/pagination';

export type TableKey = string | number;

export type TableSortOrder = 'asc' | 'desc' | null;

export interface TableSorterState {
  columnKey: string;
  order: 'asc' | 'desc';
}

export type TableRowKey<TData> =
  | {
      [Key in keyof TData]-?: TData[Key] extends TableKey ? Key : never;
    }[keyof TData]
  | ((record: TData, index: number) => TableKey);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end';
}

export interface TableHeaderCellProps
  extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: 'start' | 'center' | 'end';
}

export interface TableColumn<TData = Record<string, unknown>> {
  /** 列唯一标识；省略时依次回退到 dataIndex 与列索引。 */
  key?: string;
  /** 从行数据读取字段值的属性名或嵌套路径。 */
  dataIndex?: keyof TData | readonly (string | number)[];
  /** 表头显示内容。 */
  title: ReactNode;
  /** 纯文字列名；表头非纯文本时供排序与列宽拖拽的无障碍标签使用。 */
  label?: string;
  /** 自定义单元格渲染。 */
  render?: (value: unknown, record: TData, index: number) => ReactNode;
  /** 列内容对齐方式。 */
  align?: 'start' | 'center' | 'end';
  /** 固定列宽（像素）。 */
  width?: number;
  /** 最小列宽（像素）。 */
  minWidth?: number;
  /** 最大列宽（像素）。 */
  maxWidth?: number;
  /** 剩余空间弹性分配权重（正数）；固定列或已手动拖拽列忽略。 */
  flex?: number;
  /** 固定在起点或终点。 */
  fixed?: 'left' | 'right' | 'start' | 'end';
  /** 单行省略截断；启用后自动切换为固定列宽分配。 */
  ellipsis?: boolean;
  /** 启用排序；传入 true 使用内置比较（服务端排序仅变更状态），传入函数使用自定义比较器。 */
  sorter?: boolean | ((a: TData, b: TData) => number);
  /** 排序切换顺序，默认 ['asc', 'desc']。 */
  sortDirections?: readonly ('asc' | 'desc')[];
  /** 表格开启 resizable 时控制该列是否允许拖拽调整宽度，默认 true。 */
  resizable?: boolean;
  /** 数据单元格类名。 */
  className?: string;
  /** 表头单元格类名。 */
  headerClassName?: string;
  /** 自定义数据单元格属性、事件与合并；colSpan / rowSpan 为 0 时省略单元格。 */
  onCell?: (record: TData, index: number) => TableCellProps;
  /** 自定义表头单元格属性与事件。 */
  onHeaderCell?: (column: TableColumn<TData>) => TableHeaderCellProps;
}

export interface TableRowSelection<TData = Record<string, unknown>> {
  /** 选择模式：多选或单选，默认 checkbox。 */
  type?: 'checkbox' | 'radio';
  /** 受控已选行 key 列表。 */
  selectedRowKeys?: readonly TableKey[];
  /** 非受控初始已选行 key 列表。 */
  defaultSelectedRowKeys?: readonly TableKey[];
  /** 选择变化回调。 */
  onChange?: (selectedRowKeys: TableKey[], selectedRows: TData[]) => void;
  /** 自定义单行选择控件状态（如禁用勾选）。 */
  getCheckboxProps?: (record: TData) => { disabled?: boolean };
  /** 是否固定选择列在起始侧；默认在存在起始固定列时自动固定。 */
  fixed?: boolean;
}

export interface TableExpandable<TData = Record<string, unknown>> {
  /** 渲染展开详情行内容。 */
  expandedRowRender?: (record: TData, index: number) => ReactNode;
  /** 判断行是否允许展开。 */
  rowExpandable?: (record: TData) => boolean;
  /** 受控已展开行 key 列表。 */
  expandedRowKeys?: readonly TableKey[];
  /** 非受控初始已展开行 key 列表。 */
  defaultExpandedRowKeys?: readonly TableKey[];
  /** 初始默认展开所有可展开行。 */
  defaultExpandAllRows?: boolean;
  /** 已展开行 key 列表变化回调。 */
  onExpandedRowsChange?: (expandedKeys: TableKey[]) => void;
  /** 单行展开或收起回调。 */
  onExpand?: (expanded: boolean, record: TData) => void;
  /** 树形子行每层缩进像素，默认 16。 */
  indentSize?: number;
  /** 树形数据子节点字段名，默认 'children'。 */
  childrenColumnName?: keyof TData | (string & {});
}

export interface TablePaginationProps extends Omit<PaginationProps, 'total' | 'onChange'> {
  /** 数据总条数；本地分页可省略，服务端分页传入总数，未知总数传入 -1。 */
  total?: number;
  /** 页码或每页条数变化回调。 */
  onChange?: (page: number, pageSize: number) => void;
  /** 未知总数（total < 0）时控制下一页是否可用。 */
  hasNextPage?: boolean;
}

export interface TableVirtualOptions {
  /** 测量前的估算行高（含展开详情），默认 48。 */
  estimateRowHeight?: number;
  /** 可视区前后额外渲染的行数，默认 5。 */
  overscan?: number;
}

/** 与业务行类型无关的共享展示参数，供 ConfigProvider components.Table 区域默认配置使用。 */
export interface TablePresentationProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  size?: 'sm' | 'md';
  /** 开启外框与全单元格网格线，同时隐藏表头短竖分隔线。 */
  bordered?: boolean;
  /** 开启斑马条纹交替背景并隐藏行间横向分割线。 */
  striped?: boolean;
  /** 表格视口最大高度，表头始终固定并在内部滚动。 */
  maxHeight?: CSSProperties['maxHeight'];
  /** 表格内容区域最小宽度。 */
  minWidth?: CSSProperties['minWidth'];
  /** 展示加载状态。 */
  loading?: boolean;
  /** 空数据内容。 */
  emptyContent?: ReactNode;
  /** 请求失败提示；null、undefined 或 false 不展示。 */
  error?: ReactNode;
  /** 请求失败重试回调。 */
  onRetry?: () => void;
  /** 开启列宽拖拽调整。 */
  resizable?: boolean;
  /** 开启行虚拟滚动。 */
  virtual?: boolean | TableVirtualOptions;
  /** 分页开关或分页展示参数；直接展示本地数据时，false 同时关闭本地切页。 */
  pagination?: boolean | TablePaginationProps;
  /** 原生 table DOM 引用。 */
  tableRef?: Ref<HTMLTableElement>;
}
