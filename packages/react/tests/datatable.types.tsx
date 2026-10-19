import type { ColumnDef, Table as TableInstance } from '@tanstack/react-table';
import * as root from '../src';
import {
  DataTable,
  type DataTableCellProps,
  type DataTableProps,
  type DataTableRowProps,
} from '../src/table';

interface RecordRow {
  id: string;
  name: string;
}

const data: RecordRow[] = [{ id: 'leaf', name: 'Leaf UI' }];
const columns: ColumnDef<RecordRow>[] = [{ accessorKey: 'name', header: 'Name' }];

export function dataTableTypeContracts(table: TableInstance<RecordRow>) {
  const row: DataTableRowProps = { className: 'project-row' };
  const cell: DataTableCellProps = { className: 'project-cell', align: 'end' };
  const props: DataTableProps<RecordRow> = {
    table,
    getRowProps: (record) => ({ ...row, title: record.original.name }),
    getCellProps: (record) => ({ ...cell, title: record.row.original.name }),
  };
  const instance = <DataTable {...props} />;
  const direct = <DataTable data={data} columns={columns} rowKey="id" />;
  // @ts-expect-error A data source requires a stable row key.
  const missingKey = <DataTable data={data} columns={columns} />;
  // @ts-expect-error A table instance owns its own data and columns.
  const mixed = <DataTable table={table} data={data} columns={columns} rowKey="id" />;
  // @ts-expect-error Table is no longer part of the root public API.
  const removedTable = root.Table;
  // @ts-expect-error DataTable stays in its optional peer entry.
  const rootDataTable = root.DataTable;
  // @ts-expect-error Native Table compound parts are no longer available.
  const removedBody = DataTable.Body;
  return { instance, direct, missingKey, mixed, removedTable, rootDataTable, removedBody };
}
