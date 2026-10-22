import { ConfigProvider } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import type { ColumnDef } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

type Row = {
  id: string;
  name: string;
  team: string;
  status: string;
};

const rows: Row[] = [
  { id: 'alpha', name: 'Alpha', team: 'Design', status: 'Active' },
  { id: 'bravo', name: 'Bravo', team: 'Engineering', status: 'Active' },
  { id: 'charlie', name: 'Charlie', team: 'Product', status: 'Invited' },
  { id: 'delta', name: 'Delta', team: 'Operations', status: 'Active' },
];

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'team', header: 'Team', size: 220 },
  { accessorKey: 'status', header: 'Status', size: 140 },
];

const pinnedColumns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name', size: 260 },
  { accessorKey: 'team', header: 'Team', size: 360 },
  { accessorKey: 'status', header: 'Status', size: 240 },
];

const stackStyle = {
  display: 'grid',
  gap: 24,
  minWidth: 0,
} as const;

function ScopeTable({ label, selection = false }: { label: string; selection?: boolean }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      rowKey="id"
      aria-label={label}
      selection={selection ? 'multiple' : false}
      pagination={false}
      striped
    />
  );
}

function ActionTable({ label }: { label: string }) {
  return (
    <DataTable
      data={rows}
      columns={columns}
      rowKey="id"
      aria-label={label}
      selection="multiple"
      pagination={false}
      getRowLabel={(row) => row.original.name}
      onRowReorder={() => undefined}
      renderExpandedRow={(row) => <div>Details for {row.original.name}</div>}
      options={{ getRowCanExpand: () => true }}
    />
  );
}

function LoadingTable({ label, style }: { label: string; style?: CSSProperties }) {
  return (
    <div style={style}>
      <DataTable
        data={rows}
        columns={columns}
        rowKey="id"
        aria-label={label}
        loading
        pagination={false}
      />
    </div>
  );
}

function PinnedTable() {
  return (
    <div style={{ width: 420, minWidth: 0 }}>
      <DataTable
        data={rows}
        columns={pinnedColumns}
        rowKey="id"
        aria-label="Pinned table color contract"
        pagination={false}
        minWidth={900}
        options={{
          initialState: {
            columnPinning: { left: ['name'], right: ['status'] },
          },
        }}
      />
    </div>
  );
}

const compatibilityOverlayStyle = {
  '--leaf-color-surface-alpha-80': 'rgb(12 34 56 / 0.4)',
} as CSSProperties;

export function TableColorContractFixture() {
  return (
    <ConfigProvider theme={{ motion: false }} style={{ minHeight: 0 }}>
      <div style={{ display: 'grid', gap: 32, maxWidth: 960, minWidth: 0 }}>
        <h1>Table color contract</h1>
        <section aria-label="Default table recipe" style={stackStyle}>
          <ScopeTable label="Default table color contract" selection />
          <ActionTable label="Default action table color contract" />
          <LoadingTable label="Default loading table color contract" />
          <LoadingTable
            label="Compatibility loading table color contract"
            style={compatibilityOverlayStyle}
          />
          <PinnedTable />
        </section>
        <section aria-label="Explicit primary soft color" style={stackStyle}>
          <ConfigProvider
            theme={{ tokens: { primarySoftColor: '#ff2d95' } }}
            style={{ minHeight: 0 }}
          >
            <ActionTable label="Explicit primarySoft table color contract" />
          </ConfigProvider>
        </section>
        <section aria-label="Local theme and custom surface" style={stackStyle}>
          <ScopeTable label="Outer table before local theme" />
          <ConfigProvider theme={{ primaryColor: '#c026d3' }} style={{ minHeight: 0 }}>
            <div style={stackStyle}>
              <ScopeTable label="Local theme table color contract" selection />
              <ConfigProvider
                theme={{
                  components: {
                    Table: { background: '#fafafa', color: '#333333' },
                  },
                }}
                style={{ minHeight: 0 }}
              >
                <ScopeTable label="Custom surface table color contract" />
              </ConfigProvider>
            </div>
          </ConfigProvider>
          <ScopeTable label="Outer table after local theme" />
        </section>
      </div>
    </ConfigProvider>
  );
}
