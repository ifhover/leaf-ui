import * as root from '../src';
import {
  Table,
  type TableCellProps,
  type TableColumn,
  type TableKey,
  type TableProps,
  type TableRowKey,
  type TableRowProps,
  type TableSorterState,
} from '../src';
import { Table as SubpathTable } from '../src/table';

interface RecordRow {
  id: string;
  name: string;
  age: number;
  children?: RecordRow[];
}

const data: RecordRow[] = [{ id: 'leaf', name: 'Leaf UI', age: 2 }];
const columns: TableColumn<RecordRow>[] = [
  { title: 'Name', dataIndex: 'name', sorter: true },
  { title: 'Age', dataIndex: 'age', align: 'end', sorter: (a, b) => a.age - b.age },
];

export function tableTypeContracts() {
  const row: TableRowProps = { className: 'project-row' };
  const cell: TableCellProps = { className: 'project-cell', align: 'end' };
  const props: TableProps<RecordRow> = {
    data,
    columns,
    rowKey: 'id',
    onRow: (record) => ({ ...row, title: record.name }),
    rowSelection: {
      type: 'checkbox',
      onChange: (keys: TableKey[], rows: RecordRow[]) => {
        void keys;
        void rows[0]?.name;
      },
    },
    expandable: {
      expandedRowRender: (record) => record.name,
    },
    onSortChange: (sorter: TableSorterState | null) => {
      void sorter?.columnKey;
    },
  };
  const direct = <Table {...props} />;
  const subpath = <SubpathTable data={data} columns={columns} rowKey="id" />;
  const numericKey = <Table data={data} columns={columns} rowKey={(record) => record.id.length} />;
  const readonlyColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'end',
      headerClassName: 'heading',
      flex: 2,
      onCell: (record) => ({ ...cell, title: record.name }),
    },
  ] as const satisfies readonly TableColumn<RecordRow>[];
  const readonlyDirect = <Table data={data} columns={readonlyColumns} rowKey="id" />;

  const invalidColumns: TableColumn<RecordRow>[] = [
    // @ts-expect-error Flexible column weights must be numeric.
    { title: 'Name', dataIndex: 'name', flex: 'auto' },
    // @ts-expect-error Column alignment accepts start, center, or end.
    { title: 'Name', dataIndex: 'name', align: 'sideways' },
    // @ts-expect-error Misspelled column properties must not silently disappear.
    { title: 'Name', dataIndex: 'name', headerClasName: 'heading' },
  ];

  const validField: TableRowKey<{ id: number; active: boolean }> = 'id';
  // @ts-expect-error Boolean fields are not valid row identities.
  const booleanField: TableRowKey<{ id: string; active: boolean }> = 'active';
  // @ts-expect-error Object fields are not valid row identities.
  const objectField: TableRowKey<{ id: string; details: object }> = 'details';
  // @ts-expect-error Optional fields cannot guarantee an identity for every row.
  const optionalField: TableRowKey<{ id: string; optional?: string }> = 'optional';
  // @ts-expect-error A data source requires a stable row key.
  const missingKey = <Table data={data} columns={columns} />;
  // @ts-expect-error DataTable has been replaced by Table.
  const removedDataTable = root.DataTable;
  // @ts-expect-error useDataTable has been removed.
  const removedHook = root.useDataTable;
  // @ts-expect-error useDataTableSelection has been removed.
  const removedSelectionHelper = root.useDataTableSelection;
  // @ts-expect-error Compound subcomponents are not exposed on Table.
  const removedBody = Table.Body;
  // @ts-expect-error Pinned-cell geometry is internal and cannot be overridden.
  const invalidPinnedCell: TableCellProps = { pinned: 'start' };
  // @ts-expect-error Pinned-cell offsets are internal.
  const invalidPinOffsetCell: TableCellProps = { pinOffset: 80 };
  // @ts-expect-error Pinned-edge shadows are internal.
  const invalidPinEdgeCell: TableCellProps = { pinEdge: true };

  return {
    direct,
    subpath,
    numericKey,
    readonlyDirect,
    invalidColumns,
    validField,
    booleanField,
    objectField,
    optionalField,
    missingKey,
    removedDataTable,
    removedHook,
    removedSelectionHelper,
    removedBody,
    invalidPinnedCell,
    invalidPinOffsetCell,
    invalidPinEdgeCell,
  };
}
