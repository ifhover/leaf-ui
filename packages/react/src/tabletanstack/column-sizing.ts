import type { Column, ColumnDef, Table } from '@tanstack/react-table';
import { estimateControlHeight, type LeafDensity } from '../density';
import { paddingSides } from '../shared/padding';
import type { LeafTheme } from '../theme';
import type { DataTableColumnMeta } from './tabletanstack';

const SELECTION_CONTROL_WIDTH = 18;
const EXPANSION_ICON_SIZE = 14;
const EXPANSION_TRAILING_GAP = 8;
const TABLE_INLINE_PADDING: Record<'sm' | 'md', number> = {
  sm: 12,
  md: 16,
};

function parsePx(value: string | number | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return /^\d+(?:\.\d+)?(?:px)?$/.test(trimmed) ? Number.parseFloat(trimmed) : undefined;
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

function configuredSizes<TData>(
  definitions: ColumnDef<TData>[],
  result = {
    sizes: new Set<string>(),
    bounds: new Set<string>(),
  },
) {
  for (const definition of definitions) {
    const id =
      definition.id ??
      ('accessorKey' in definition
        ? String(definition.accessorKey).replaceAll('.', '_')
        : typeof definition.header === 'string'
          ? definition.header
          : undefined);
    if (id !== undefined) {
      if (definition.size !== undefined) result.sizes.add(id);
      if (definition.minSize !== undefined || definition.maxSize !== undefined)
        result.bounds.add(id);
    }
    if ('columns' in definition && definition.columns) configuredSizes(definition.columns, result);
  }
  return result;
}

export function getColumnLayout<TData>(
  table: Table<TData>,
  columns: Column<TData>[],
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
  const configured = configuredSizes(table.options.columns);
  const sizing = table.getState().columnSizing;
  const items = columns.map((column) => {
    const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
    const specified =
      configured.sizes.has(column.id) || table.options.defaultColumn?.size !== undefined;
    const bounded =
      configured.bounds.has(column.id) ||
      table.options.defaultColumn?.minSize !== undefined ||
      table.options.defaultColumn?.maxSize !== undefined;
    const resized = sizing[column.id] !== undefined;
    const flex = meta?.flex;
    const weight =
      !column.getIsPinned() && !resized
        ? typeof flex === 'number' && Number.isFinite(flex) && flex > 0
          ? flex
          : !specified
            ? 1
            : 0
        : 0;
    const explicitFlex = typeof flex === 'number' && Number.isFinite(flex) && flex > 0;
    return {
      id: column.id,
      size: column.getSize(),
      min: explicitFlex
        ? Math.min(
            column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
            column.columnDef.minSize ?? 20,
          )
        : column.getSize(),
      max: column.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER,
      weight,
      configured: specified || bounded || resized || explicitFlex || Boolean(meta?.ellipsis),
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
  // Solve weighted widths together so a capped column releases space to the others.
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
