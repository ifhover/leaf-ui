import { Avatar, Space, Tag } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table/tanstack';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', status: 'active' },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', status: 'active' },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', status: 'invited' },
];
type Member = (typeof members)[number];

export function TableReordering({ english = false }: { english?: boolean }) {
  const [data, setData] = useState(members);
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: english ? 'Member' : '成员',
        size: 220,
        cell: ({ row }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size="sm">{row.original.name[0]}</Avatar>
            <strong>{row.original.name}</strong>
          </div>
        ),
      },
      { accessorKey: 'team', header: english ? 'Team' : '团队' },
      {
        accessorKey: 'status',
        header: english ? 'Status' : '状态',
        cell: ({ getValue }) => (
          <Tag variant="outline" color={getValue() === 'active' ? 'success' : 'default'}>
            {getValue() === 'active'
              ? english
                ? 'Active'
                : '活跃'
              : english
                ? 'Invited'
                : '已邀请'}
          </Tag>
        ),
      },
    ],
    [english],
  );
  return (
    <Space direction="vertical" align="stretch" style={{ width: '100%' }}>
      <p>
        {english ? 'Use the handles to reorder rows or columns.' : '使用行首和表头的手柄调整顺序。'}
      </p>
      <DataTable
        data={data}
        columns={columns}
        rowKey="id"
        caption={english ? 'Team priorities' : '团队顺序'}
        aria-label={english ? 'Reorderable team' : '可排序团队'}
        getRowLabel={(row) => row.original.name}
        options={{ enableSorting: false }}
        pagination={false}
        columnReordering
        onRowReorder={({ rows }) => setData(rows.map((row) => row.original))}
      />
    </Space>
  );
}
