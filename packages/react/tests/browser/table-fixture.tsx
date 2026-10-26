import { Button, ConfigProvider, Input } from '@ifhover/leaf-ui';
import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';
import type { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { TableColumns as DocumentedTableColumns } from '../../../../apps/docs/src/examples/en/table/columns';
import { TableGrouped } from '../../../../apps/docs/src/examples/en/table/grouped';
import { TableReordering } from '../../../../apps/docs/src/examples/en/table/reordering';
import { TableServer } from '../../../../apps/docs/src/examples/en/table/server';
import { TableSimple } from '../../../../apps/docs/src/examples/en/table/simple';
import { TableAppearance } from './table-appearance-fixture';
import { TableBasic, TableSelection, TableStates } from './table-basic-fixture';
import { TableColumns, TableData } from './table-data-fixture';

const records = Array.from({ length: 10000 }, (_, index) => ({
  id: String(index),
  name: `Person ${String(index).padStart(5, '0')}`,
  description:
    index % 3 === 0
      ? 'A longer description that wraps onto multiple lines when the available space changes.'
      : 'A short description.',
}));
type RecordRow = (typeof records)[number];
const apiRecords = records.slice(0, 14);
const apiColumns: ColumnDef<RecordRow>[] = [{ accessorKey: 'name', header: 'Name' }];

function PinningOverflowFixture() {
  const [narrow, setNarrow] = useState(true);
  const [pinningChanges, setPinningChanges] = useState(0);
  const table = useDataTable({
    data: apiRecords,
    columns: [
      { accessorKey: 'name', header: 'Name', size: 200, minSize: 160, maxSize: 320 },
      { accessorKey: 'description', header: 'Description', size: 420 },
      { id: 'projects', header: 'Projects', accessorFn: (row) => row.id, size: 100 },
    ],
    rowKey: 'id',
    localPagination: false,
    options: {
      state: { columnPinning: { left: ['name'], right: ['projects'] } },
      onColumnPinningChange: () => setPinningChanges((count) => count + 1),
    },
  });
  return (
    <section aria-label="Pinning overflow demo">
      <Button onClick={() => setNarrow((value) => !value)}>Toggle container width</Button>
      <Button onClick={() => table.getColumn('projects')?.toggleVisibility()}>
        Toggle projects
      </Button>
      <Button onClick={() => table.resetColumnSizing()}>Reset column widths</Button>
      <output aria-label="Pinning state">{JSON.stringify(table.getState().columnPinning)}</output>
      <output aria-label="Pinning changes">{pinningChanges}</output>
      <div style={{ width: narrow ? 293 : 500, maxWidth: '100%' }}>
        <DataTable
          table={table}
          aria-label="Overflowing pinned columns"
          pagination={false}
          maxHeight={180}
          resizable
        />
      </div>
    </section>
  );
}

function ApiTable() {
  const [pagination, setPagination] = useState(true);
  const table = useDataTable({
    data: apiRecords,
    columns: apiColumns,
    rowKey: 'id',
    options: { manualPagination: true, pageCount: -1 },
  });
  return (
    <section aria-label="Table API demo">
      <h2>Automatic layout and dynamic pagination</h2>
      <DataTable
        data={apiRecords}
        columns={apiColumns}
        rowKey="id"
        aria-label="Dynamic pagination"
        selection="multiple"
        pagination={pagination ? { showSizeChanger: false } : false}
        toolbar={
          <>
            <Button onClick={() => setPagination((value) => !value)}>Toggle pagination</Button>
            <DataTable.Search columnId="name" />
          </>
        }
      />
      <DataTable
        table={table}
        aria-label="Unknown total"
        pagination={{
          id: 'unknown-total-pages',
          'aria-label': 'Unknown pages',
          style: { marginTop: 12 },
          hasNextPage: false,
        }}
      />
    </section>
  );
}

const columns: ColumnDef<RecordRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    cell: ({ row }) => (
      <Input aria-label={`Edit ${row.original.name}`} defaultValue={row.original.name} />
    ),
  },
  { accessorKey: 'description', header: 'Description', size: 260 },
];

function VirtualTable() {
  const [narrow, setNarrow] = useState(false);
  const table = useDataTable({
    data: records,
    columns,
    rowKey: 'id',
    localPagination: false,
    options: { getRowCanExpand: () => true },
  });
  return (
    <section aria-label="Virtual table demo">
      <h2>Virtual data</h2>
      <Button onClick={() => setNarrow((value) => !value)}>Toggle virtual width</Button>
      <div style={{ width: narrow ? 460 : '100%', marginTop: 12 }}>
        <DataTable
          table={table}
          aria-label="Large table"
          maxHeight={320}
          virtual
          pagination={false}
          renderExpandedRow={(row) => (
            <div style={{ height: Number(row.id) % 2 === 0 ? 160 : 72 }}>
              Details for {row.original.name}
            </div>
          )}
        />
      </div>
    </section>
  );
}

function LayeredTableFixture() {
  const [longHeading, setLongHeading] = useState(false);
  const details: ColumnDef<RecordRow>[] = [
    { accessorKey: 'name', header: 'Name', size: 220 },
    { accessorKey: 'description', header: 'Description', size: 420 },
  ];
  const columns: ColumnDef<RecordRow>[] = [
    {
      header: longHeading ? 'People and their current project information' : 'People',
      columns: longHeading ? [{ header: 'Assignment', columns: details }] : details,
    },
  ];
  // A legacy JavaScript option must not disable the fixed header.
  const legacyOptions = { stickyHeader: false };
  return (
    <section aria-label="Layered table demo">
      <h1>Layered table</h1>
      <DataTable
        {...legacyOptions}
        data={records.slice(0, 100)}
        columns={columns}
        rowKey="id"
        aria-label="Layered records"
        style={{ height: 280 }}
        pagination={false}
        toolbar={<Button onClick={() => setLongHeading((value) => !value)}>Change heading</Button>}
      />
      <p style={{ marginTop: 800 }}>Page scroll target</p>
    </section>
  );
}

function SimpleTableFixture() {
  const [simple, setSimple] = useState(true);
  return (
    <section aria-label="Simple table demo">
      <h1>Simple table</h1>
      <TableSimple />
      <Button onClick={() => setSimple((value) => !value)}>Toggle simple appearance</Button>
      <ConfigProvider
        components={{ DataTable: { variant: 'simple', striped: true, columnDividers: true } }}
        theme={{
          tokens: { borderWidth: 3 },
          components: { Table: { shadow: '0 4px 12px currentColor' } },
        }}
      >
        <DataTable
          variant={simple ? undefined : 'layered'}
          data={apiRecords}
          columns={[
            {
              header: 'Records',
              columns: [
                { accessorKey: 'name', header: 'Name', size: 220 },
                {
                  accessorKey: 'description',
                  header: 'Description',
                  size: 450,
                  meta: { align: 'end' },
                },
              ],
            },
          ]}
          rowKey="id"
          aria-label="Simple pinned records"
          options={{ enableSorting: true, initialState: { columnPinning: { left: ['name'] } } }}
          localPagination={false}
          selection="multiple"
          pagination={false}
          maxHeight={220}
        />
      </ConfigProvider>
    </section>
  );
}

export function TableFixture() {
  if (new URLSearchParams(location.search).has('pinning-overflow'))
    return <PinningOverflowFixture />;
  if (new URLSearchParams(location.search).has('current-columns'))
    return <DocumentedTableColumns />;
  if (new URLSearchParams(location.search).has('simple')) return <SimpleTableFixture />;
  if (new URLSearchParams(location.search).has('layered')) return <LayeredTableFixture />;
  return (
    <div style={{ display: 'grid', gap: 32, maxWidth: 1000, minWidth: 0 }}>
      <h1>Table acceptance</h1>
      <section aria-label="Basic table demo">
        <h2>Data table</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <TableBasic english />
        </div>
      </section>
      <section aria-label="Table appearance demo">
        <h2>Column dividers and stripes</h2>
        <TableAppearance english />
      </section>
      <section aria-label="Data table demo">
        <h2>Manage members</h2>
        <TableData english />
      </section>
      <section aria-label="Controlled selection demos">
        <h2>Control only selection</h2>
        <ConfigProvider locale="zh-CN">
          <TableSelection />
        </ConfigProvider>
        <TableSelection english />
      </section>
      <ApiTable />
      <section aria-label="Pinned table demo">
        <h2>Pinned columns</h2>
        <TableColumns english />
      </section>
      <section aria-label="Grouped table demo">
        <h2>Grouping</h2>
        <TableGrouped />
      </section>
      <section aria-label="Server table demo">
        <h2>Server data</h2>
        <TableServer />
      </section>
      <VirtualTable />
      <section aria-label="Reordering table demo">
        <h2>Row and column reordering</h2>
        <TableReordering />
      </section>
      <section aria-label="State table demo">
        <h2>Data states</h2>
        <TableStates english />
      </section>
      <ConfigProvider
        theme={{
          primaryColor: '#1d9bf0',
          borderRadius: 8,
          components: {
            Table: { padding: '8px 12px', background: '#fafafa', color: '#333333', fontSize: 13 },
          },
        }}
        density="compact"
      >
        <DataTable
          aria-label="Custom theme"
          data={[{ id: 'custom', name: 'Custom tokens' }]}
          columns={[{ accessorKey: 'name', header: 'Theme' }]}
          rowKey="id"
          pagination={false}
        />
      </ConfigProvider>
    </div>
  );
}
