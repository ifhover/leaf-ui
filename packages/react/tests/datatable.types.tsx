import type { ColumnDef, Table as TableInstance } from '@tanstack/react-table';
import * as root from '../src';
import {
  DataTable,
  type DataTableCellProps,
  type DataTableColumnDef,
  type DataTableColumnMeta,
  type DataTableInstanceProps,
  type DataTableProps,
  type DataTableRowKey,
  type DataTableRowProps,
  type DataTableSelectionOptions,
  type UseDataTableSelectionResult,
  useDataTable,
  useDataTableSelection,
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
  const directProps: DataTableProps<RecordRow> = { data, columns, rowKey: 'id' };
  const forwarded = <DataTable {...directProps} />;
  const instanceProps: DataTableInstanceProps<RecordRow> = props;
  const numericKey = <DataTable data={data} columns={columns} rowKey={(row) => row.id.length} />;
  const readonlyColumns = [
    { accessorKey: 'name', header: 'Name', meta: { align: 'end' } },
  ] as const satisfies readonly ColumnDef<RecordRow>[];
  const readonlyDirect = <DataTable data={data} columns={readonlyColumns} rowKey="id" />;
  const typedColumns: DataTableColumnDef<RecordRow>[] = [
    { accessorKey: 'name', meta: { align: 'end', headerClassName: 'heading' } },
    // @ts-expect-error Leaf metadata validates alignment without global module augmentation.
    { accessorKey: 'name', meta: { align: 'sideways' } },
    // @ts-expect-error Misspelled metadata properties must not silently disappear.
    { accessorKey: 'name', meta: { headerClasName: 'heading' } },
  ];
  const nativeColumn: ColumnDef<RecordRow> = {
    accessorKey: 'name',
    meta: { align: 'end' } satisfies DataTableColumnMeta,
  };
  // @ts-expect-error Props stay mutually exclusive when assigned outside JSX.
  const mixedProps: DataTableProps<RecordRow> = { table, data, columns, rowKey: 'id' };
  const validField: DataTableRowKey<{ id: number; active: boolean }> = 'id';
  // @ts-expect-error Boolean fields are not valid row identities.
  const booleanField: DataTableRowKey<{ id: string; active: boolean }> = 'active';
  // @ts-expect-error Object fields are not valid row identities.
  const objectField: DataTableRowKey<{ id: string; details: object }> = 'details';
  // @ts-expect-error Optional fields cannot guarantee an identity for every row.
  const optionalField: DataTableRowKey<{ id: string; optional?: string }> = 'optional';
  // @ts-expect-error A data source requires a stable row key.
  const missingKey = <DataTable data={data} columns={columns} />;
  // @ts-expect-error A table instance owns its own data and columns.
  const mixed = <DataTable table={table} data={data} columns={columns} rowKey="id" />;
  // @ts-expect-error Table is no longer part of the root public API.
  const removedTable = root.Table;
  // @ts-expect-error DataTable stays in its optional peer entry.
  const rootDataTable = root.DataTable;
  // @ts-expect-error The hook must not make the root require the optional peer dependency.
  const rootHook = root.useDataTable;
  // @ts-expect-error Native Table compound parts are no longer available.
  const removedBody = DataTable.Body;
  // @ts-expect-error Selection helpers stay in the optional table entry.
  const rootSelectionHelper = root.useDataTableSelection;
  // @ts-expect-error Pinned-cell geometry is internal and cannot be overridden.
  const invalidPinnedCell: DataTableCellProps = { pinned: 'start' };
  // @ts-expect-error Pinned-cell offsets are internal.
  const invalidPinOffsetCell: DataTableCellProps = { pinOffset: 80 };
  // @ts-expect-error Pinned-edge shadows are internal.
  const invalidPinEdgeCell: DataTableCellProps = { pinEdge: true };
  return {
    instance,
    direct,
    forwarded,
    instanceProps,
    numericKey,
    readonlyDirect,
    typedColumns,
    nativeColumn,
    mixedProps,
    validField,
    booleanField,
    objectField,
    optionalField,
    missingKey,
    mixed,
    removedTable,
    rootDataTable,
    rootHook,
    removedBody,
    rootSelectionHelper,
    invalidPinnedCell,
    invalidPinOffsetCell,
    invalidPinEdgeCell,
  };
}

export function HookTypeContracts() {
  const table = useDataTable({ data, columns, rowKey: 'id' });
  const readonlyTable = useDataTable({
    data,
    columns: [
      { accessorKey: 'name', header: 'Name', meta: { align: 'start' } },
    ] as const satisfies readonly ColumnDef<RecordRow>[],
    rowKey: 'id',
  });
  const selection = useDataTableSelection({
    mode: 'multiple',
    selectedRowKeys: ['leaf'] as const,
  });
  const selectionOptions: DataTableSelectionOptions = selection.selectionOptions;
  const selectionResult: UseDataTableSelectionResult = selection;
  const selectionTable = useDataTable({
    data,
    columns,
    rowKey: 'id',
    options: selectionOptions,
  });
  const name: string = table.getRowModel().rows[0]?.original.name ?? '';
  return (
    <>
      <DataTable table={table} aria-label={name} />
      <DataTable table={readonlyTable} />
      <DataTable table={selectionTable} />
      <DataTable table={readonlyTable} aria-label={selectionResult.selectedRowKeys.join(',')} />
    </>
  );
}
