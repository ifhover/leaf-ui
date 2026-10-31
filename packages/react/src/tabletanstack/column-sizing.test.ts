import {
  type ColumnDef,
  createTable,
  getCoreRowModel,
  type TableOptions,
} from '@tanstack/react-table';
import { describe, expect, it } from 'vitest';
import { getColumnLayout } from './column-sizing';

type RecordRow = { name: string; description: string; status: string };

function layout(
  columns: ColumnDef<RecordRow>[],
  availableWidth = 1000,
  options: Partial<TableOptions<RecordRow>> = {},
  forceFixed = false,
  utilityWidth = 0,
) {
  const table = createTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
  });
  table.setOptions((previous) => ({
    ...previous,
    state: { ...table.initialState, ...options.state },
  }));
  const visible = table.getVisibleLeafColumns();
  return getColumnLayout(table, visible, { forceFixed, availableWidth, utilityWidth });
}

describe('DataTable column layout', () => {
  it('leaves ordinary unsized columns to native content layout, including grouped definitions', () => {
    const result = layout([
      { header: 'Details', columns: [{ accessorKey: 'name' }, { accessorKey: 'description' }] },
      { accessorKey: 'status' },
    ]);
    expect(result.fixed).toBe(false);
    expect(result.widths.size).toBe(0);
  });

  it('preserves every explicit width, including the final column, without stretching it', () => {
    const result = layout([
      { accessorKey: 'name', size: 240 },
      { accessorKey: 'status', size: 100 },
    ]);
    expect(result.fixed).toBe(true);
    expect([...result.widths.values()]).toEqual([240, 100]);
    expect(result.totalWidth).toBe(340);
  });

  it('assigns remaining space to unsized columns and reserves selection/expansion widths', () => {
    const result = layout(
      [{ accessorKey: 'name' }, { accessorKey: 'status', size: 100 }],
      1000,
      {},
      false,
      88,
    );
    expect(result.widths.get('name')).toBeCloseTo(812);
    expect(result.widths.get('status')).toBe(100);
    expect(result.totalWidth).toBeCloseTo(1000);
  });

  it('distributes flex by weight and reallocates space after a maximum is reached', () => {
    const columns: ColumnDef<RecordRow>[] = [
      { accessorKey: 'name', meta: { flex: 2 }, minSize: 200, maxSize: 400 },
      { accessorKey: 'description', meta: { flex: 1 }, minSize: 100 },
      { accessorKey: 'status', size: 100 },
    ];
    const wide = layout(columns);
    expect(wide.widths.get('name')).toBeCloseTo(400);
    expect(wide.widths.get('description')).toBeCloseTo(500);
    const medium = layout(columns, 700);
    expect(medium.widths.get('name')).toBeCloseTo(400);
    expect(medium.widths.get('description')).toBeCloseTo(200);
    const narrow = layout(columns, 250);
    expect([...narrow.widths.values()].sort((a, b) => a - b)).toEqual([100, 100, 200]);
    expect(narrow.totalWidth).toBe(400);
  });

  it('keeps pinned and manually resized columns at their TanStack sizes', () => {
    const result = layout(
      [
        { accessorKey: 'name', size: 180, meta: { flex: 2 } },
        { accessorKey: 'description', meta: { flex: 1 } },
        { accessorKey: 'status', size: 100, meta: { flex: 1 } },
      ],
      1000,
      {
        state: {
          columnSizing: { description: 360 },
          columnPinning: { left: ['name'], right: ['status'] },
        },
      },
      true,
    );
    expect([...result.widths.values()]).toEqual([180, 360, 100]);
  });

  it('uses deterministic fallback widths for virtual/resizable tables before measurement', () => {
    const result = layout([{ accessorKey: 'name' }, { accessorKey: 'status' }], 0, {}, true);
    expect(result.fixed).toBe(true);
    expect([...result.widths.values()]).toEqual([150, 150]);
  });

  it('retains width bounds when space is exhausted or every flexible column reaches its maximum', () => {
    const bounded = layout([{ accessorKey: 'name', minSize: 200, maxSize: 260 }], 100);
    expect(bounded.fixed).toBe(true);
    expect(bounded.totalWidth).toBe(200);
    const capped = layout([
      { accessorKey: 'name', meta: { flex: 2 }, maxSize: 200 },
      { accessorKey: 'description', meta: { flex: 1 }, maxSize: 100 },
    ]);
    expect(capped.totalWidth).toBe(300);
  });

  it('honors defaultColumn sizes, visibility and sizing state without relying on merged defaults', () => {
    const result = layout(
      [
        { header: 'Details', columns: [{ accessorKey: 'name', size: 240 }] },
        { accessorKey: 'status' },
      ],
      1000,
      {
        defaultColumn: { size: 120 },
        state: { columnVisibility: { name: false }, columnSizing: { status: 180 } },
      },
    );
    expect([...result.widths.values()]).toEqual([180]);
    expect(result.totalWidth).toBe(180);
    expect(
      layout([{ accessorKey: 'name' }], 1000, { defaultColumn: { size: 120 } }).widths.get('name'),
    ).toBe(120);
  });
});
