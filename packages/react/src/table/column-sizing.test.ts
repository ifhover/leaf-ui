import { describe, expect, it } from 'vitest';
import {
  computePinLayout,
  getColumnLayout,
  normalizeColumns,
  resolveUtilityWidths,
} from './column-sizing';
import type { TableColumn } from './types';

interface SampleRow {
  id: string;
  name: string;
  role: string;
  bio: string;
  action: string;
}

describe('table column sizing and pinning', () => {
  it('computes utility column widths across sizes, bordered grids, and custom table padding', () => {
    expect(
      resolveUtilityWidths({
        size: 'md',
        selection: true,
        expandable: true,
        theme: {},
        density: 'comfortable',
        direction: 'ltr',
      }),
    ).toEqual({ selectionWidth: 34, expansionWidth: 34 });

    expect(
      resolveUtilityWidths({
        size: 'sm',
        bordered: true,
        selection: true,
        expandable: false,
        theme: {},
        density: 'comfortable',
        direction: 'ltr',
      }),
    ).toEqual({ selectionWidth: 31, expansionWidth: 0 });

    expect(
      resolveUtilityWidths({
        size: 'md',
        selection: false,
        expandable: true,
        theme: { components: { Table: { padding: '8px 20px 8px 24px' } } },
        density: 'comfortable',
        direction: 'ltr',
      }),
    ).toEqual({ selectionWidth: 0, expansionWidth: 44 });
  });

  it('orders columns as start-pinned, center, then end-pinned and deduplicates keys', () => {
    const columns: TableColumn<SampleRow>[] = [
      { title: 'Bio', dataIndex: 'bio' },
      { title: 'Action', key: 'action', fixed: 'right', width: 100 },
      { title: 'Name', dataIndex: 'name', fixed: 'left', width: 120 },
      { title: 'Role', dataIndex: 'role' },
    ];
    const normalized = normalizeColumns(columns);
    expect(normalized.map((item) => item.key)).toEqual(['name', 'bio', 'role', 'action']);
    expect(normalized.map((item) => item.pin)).toEqual(['start', undefined, undefined, 'end']);
  });

  it('uses auto layout when no sizes, bounds, flex, ellipsis, or fixed flags are set', () => {
    const columns = normalizeColumns<SampleRow>([
      { title: 'Name', dataIndex: 'name' },
      { title: 'Role', dataIndex: 'role' },
    ]);
    const layout = getColumnLayout(
      columns,
      {},
      { forceFixed: false, availableWidth: 800, utilityWidth: 0 },
    );
    expect(layout.fixed).toBe(false);
    expect(layout.totalWidth).toBe(0);
  });

  it('distributes weighted flex widths with maxWidth spillover and pins offsets accurately', () => {
    const columns = normalizeColumns<SampleRow>([
      { title: 'Name', dataIndex: 'name', fixed: 'left', width: 120 },
      { title: 'Role', dataIndex: 'role', flex: 1, minWidth: 100, maxWidth: 180 },
      { title: 'Bio', dataIndex: 'bio', flex: 2, minWidth: 100 },
      { title: 'Action', key: 'action', fixed: 'right', width: 100 },
    ]);
    const layout = getColumnLayout(
      columns,
      {},
      { forceFixed: true, availableWidth: 834, utilityWidth: 34 },
    );
    expect(layout.fixed).toBe(true);
    expect(layout.widths.get('name')).toBe(120);
    expect(layout.widths.get('action')).toBe(100);
    expect(Math.round(layout.widths.get('role') ?? 0)).toBe(180);
    expect(Math.round(layout.widths.get('bio') ?? 0)).toBe(400);

    const pins = computePinLayout(columns, layout.widths, {
      selectionPinned: true,
      selectionWidth: 34,
      expansionPinned: false,
      expansionWidth: 0,
    });
    expect(pins.selectionPin).toEqual({ pinned: 'start', pinOffset: 0, pinEdge: false });
    expect(pins.columnPins.get('name')).toEqual({ pinned: 'start', pinOffset: 34, pinEdge: true });
    expect(pins.columnPins.get('action')).toEqual({ pinned: 'end', pinOffset: 0, pinEdge: true });
    expect(pins.pinnedWidth).toBe(254);
  });
});
