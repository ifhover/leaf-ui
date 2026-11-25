import { estimateControlHeight, type LeafDensity } from '../density';
import { paddingSides } from '../shared/padding';
import type { LeafTheme } from '../theme';
import type { TableColumn } from './types';

const SELECTION_CONTROL_WIDTH = 18;
const EXPANSION_ICON_SIZE = 14;
const EXPANSION_TRAILING_GAP = 8;
const DEFAULT_FIXED_COLUMN_WIDTH = 150;
const DEFAULT_MIN_COLUMN_WIDTH = 20;
const TABLE_INLINE_PADDING: Record<'sm' | 'md', number> = {
  sm: 12,
  md: 16,
};

export interface NormalizedColumn<TData> {
  key: string;
  column: TableColumn<TData>;
  pin: 'start' | 'end' | undefined;
  index: number;
}

export interface ColumnPinInfo {
  pinned?: 'start' | 'end';
  pinOffset?: number;
  pinEdge?: boolean;
}

function parsePx(value: string | number | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return /^\d+(?:\.\d+)?(?:px)?$/.test(trimmed) ? Number.parseFloat(trimmed) : undefined;
}

/** 统一解析列的固定逻辑方向（兼容 left/right 与 start/end）。 */
export function normalizeColumnPin(
  fixed: TableColumn<unknown>['fixed'],
): 'start' | 'end' | undefined {
  if (fixed === 'left' || fixed === 'start') return 'start';
  if (fixed === 'right' || fixed === 'end') return 'end';
  return undefined;
}

/** 为列定义生成稳定的唯一标识。 */
export function resolveColumnKey<TData>(column: TableColumn<TData>, index: number): string {
  if (column.key !== undefined && column.key !== '') return column.key;
  if (typeof column.dataIndex === 'string' && column.dataIndex !== '') return column.dataIndex;
  if (typeof column.dataIndex === 'number') return String(column.dataIndex);
  if (Array.isArray(column.dataIndex) && column.dataIndex.length > 0)
    return column.dataIndex.map(String).join('.');
  return `__col_${index}`;
}

/** 按起点固定 → 普通 → 终点固定的顺序排列列，避免重复 key 冲突。 */
export function normalizeColumns<TData>(
  columns: readonly TableColumn<TData>[],
): NormalizedColumn<TData>[] {
  const seen = new Map<string, number>();
  const normalized = columns.map((column, index) => {
    const base = resolveColumnKey(column, index);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return {
      key: count === 0 ? base : `${base}__${count}`,
      column,
      pin: normalizeColumnPin(column.fixed),
      index,
    };
  });
  const start: NormalizedColumn<TData>[] = [];
  const center: NormalizedColumn<TData>[] = [];
  const end: NormalizedColumn<TData>[] = [];
  for (const item of normalized) {
    if (item.pin === 'start') start.push(item);
    else if (item.pin === 'end') end.push(item);
    else center.push(item);
  }
  return [...start, ...center, ...end];
}

/** 根据表格尺寸、密度、网格边框与主题覆写推导选择列和展开列的逻辑宽度，与 SCSS 公式保持一致。 */
export function resolveUtilityWidths({
  size,
  bordered = false,
  selection,
  expandable,
  theme,
  density,
  direction,
}: {
  size: 'sm' | 'md';
  bordered?: boolean;
  selection: boolean;
  expandable: boolean;
  theme: LeafTheme;
  density: LeafDensity;
  direction: 'ltr' | 'rtl';
}) {
  const tablePadding = theme.components?.Table?.padding;
  let tableEdgeStart: number | undefined;
  if (tablePadding !== undefined) {
    const raw = typeof tablePadding === 'number' ? `${tablePadding}px` : tablePadding;
    const sides = paddingSides(raw);
    tableEdgeStart = parsePx(direction === 'rtl' ? sides[1] : sides[3]);
  }
  const edgeStart = tableEdgeStart ?? TABLE_INLINE_PADDING[size];

  const buttonHeight = parsePx(theme.components?.Button?.controlHeight);
  const expandButtonSize =
    buttonHeight !== undefined
      ? Math.max(1, buttonHeight - 6)
      : (parsePx(theme.tokens?.controlHeightSm) ??
        Math.max(1, estimateControlHeight(theme, density) - 6));
  const expansionStart = selection
    ? EXPANSION_TRAILING_GAP
    : Math.max(0, edgeStart - (expandButtonSize - EXPANSION_ICON_SIZE) / 2);
  const borderWidth = bordered
    ? (parsePx(theme.components?.Table?.borderWidth ?? theme.tokens?.borderWidth) ?? 1)
    : 0;

  return {
    selectionWidth: selection ? edgeStart + SELECTION_CONTROL_WIDTH + borderWidth : 0,
    expansionWidth: expandable ? expansionStart + expandButtonSize + borderWidth : 0,
  };
}

/** 计算固定列宽、拖拽宽度与弹性列权重分配结果。 */
export function getColumnLayout<TData>(
  columns: readonly NormalizedColumn<TData>[],
  resizedWidths: Readonly<Record<string, number>>,
  {
    forceFixed,
    availableWidth,
    utilityWidth,
  }: {
    forceFixed: boolean;
    availableWidth: number;
    utilityWidth: number;
  },
) {
  const items = columns.map((item) => {
    const { column, key, pin } = item;
    const specified = typeof column.width === 'number' && Number.isFinite(column.width);
    const minWidth =
      typeof column.minWidth === 'number' && Number.isFinite(column.minWidth)
        ? Math.max(1, column.minWidth)
        : undefined;
    const maxWidth =
      typeof column.maxWidth === 'number' && Number.isFinite(column.maxWidth)
        ? Math.max(1, column.maxWidth)
        : undefined;
    const bounded = minWidth !== undefined || maxWidth !== undefined;
    const resized = resizedWidths[key] !== undefined;
    const explicitFlex =
      typeof column.flex === 'number' && Number.isFinite(column.flex) && column.flex > 0;
    const baseSize = resized
      ? (resizedWidths[key] as number)
      : specified
        ? (column.width as number)
        : DEFAULT_FIXED_COLUMN_WIDTH;
    const clampedSize = Math.min(
      maxWidth ?? Number.MAX_SAFE_INTEGER,
      Math.max(minWidth ?? DEFAULT_MIN_COLUMN_WIDTH, baseSize),
    );
    const weight =
      !pin && !resized ? (explicitFlex ? (column.flex as number) : !specified ? 1 : 0) : 0;

    return {
      id: key,
      size: clampedSize,
      min: explicitFlex
        ? Math.min(maxWidth ?? Number.MAX_SAFE_INTEGER, minWidth ?? DEFAULT_MIN_COLUMN_WIDTH)
        : clampedSize,
      max: maxWidth ?? Number.MAX_SAFE_INTEGER,
      weight,
      configured: specified || bounded || resized || explicitFlex || Boolean(column.ellipsis),
    };
  });

  const fixed = forceFixed || items.some((item) => item.configured);
  const widths = new Map<string, number>();
  if (!fixed) return { fixed, widths, totalWidth: 0 };

  let remaining = availableWidth - utilityWidth;
  const flexible = items.filter((item) => item.weight > 0);
  for (const item of items) {
    if (item.weight > 0) continue;
    widths.set(item.id, item.size);
    remaining -= item.size;
  }

  // 联合求解弹性列宽度，确保触发 maxWidth 上限的列把剩余空间释放给其他弹性列。
  const minimum = flexible.reduce((sum, item) => sum + item.min, 0);
  if (remaining <= minimum) {
    for (const item of flexible) widths.set(item.id, item.min);
  } else if (flexible.length) {
    let low = 0;
    let high = remaining / Math.min(...flexible.map((item) => item.weight));
    for (let step = 0; step < 60; step++) {
      const unit = (low + high) / 2;
      const total = flexible.reduce(
        (sum, item) => sum + Math.min(item.max, Math.max(item.min, unit * item.weight)),
        0,
      );
      if (total > remaining) high = unit;
      else low = unit;
    }
    for (const item of flexible)
      widths.set(item.id, Math.min(item.max, Math.max(item.min, low * item.weight)));
  }

  const totalWidth = utilityWidth + [...widths.values()].reduce((sum, width) => sum + width, 0);
  return { fixed, widths, totalWidth };
}

/** 计算工具列与各固定列的 sticky 偏移量、边界标记及固定总宽。 */
export function computePinLayout<TData>(
  columns: readonly NormalizedColumn<TData>[],
  widths: ReadonlyMap<string, number>,
  {
    selectionPinned,
    selectionWidth,
    expansionPinned,
    expansionWidth,
  }: {
    selectionPinned: boolean;
    selectionWidth: number;
    expansionPinned: boolean;
    expansionWidth: number;
  },
) {
  const columnPins = new Map<string, ColumnPinInfo>();
  const startColumns = columns.filter((item) => item.pin === 'start');
  const endColumns = columns.filter((item) => item.pin === 'end');

  let startOffset = 0;
  let selectionPin: ColumnPinInfo = {};
  let expansionPin: ColumnPinInfo = {};

  if (selectionPinned) {
    selectionPin = {
      pinned: 'start',
      pinOffset: startOffset,
      pinEdge: !expansionPinned && startColumns.length === 0,
    };
    startOffset += selectionWidth;
  }
  if (expansionPinned) {
    expansionPin = {
      pinned: 'start',
      pinOffset: startOffset,
      pinEdge: startColumns.length === 0,
    };
    startOffset += expansionWidth;
  }
  for (let index = 0; index < startColumns.length; index++) {
    const item = startColumns[index] as NormalizedColumn<TData>;
    const width = widths.get(item.key) ?? item.column.width ?? DEFAULT_FIXED_COLUMN_WIDTH;
    columnPins.set(item.key, {
      pinned: 'start',
      pinOffset: startOffset,
      pinEdge: index === startColumns.length - 1,
    });
    startOffset += width;
  }

  let endOffset = 0;
  for (let index = endColumns.length - 1; index >= 0; index--) {
    const item = endColumns[index] as NormalizedColumn<TData>;
    const width = widths.get(item.key) ?? item.column.width ?? DEFAULT_FIXED_COLUMN_WIDTH;
    columnPins.set(item.key, {
      pinned: 'end',
      pinOffset: endOffset,
      pinEdge: index === 0,
    });
    endOffset += width;
  }

  return {
    columnPins,
    selectionPin,
    expansionPin,
    pinnedWidth: startOffset + endOffset,
  };
}
