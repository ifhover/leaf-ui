// Rich component acceptance scenarios live independently of simplified documentation examples.
import { Avatar, Button, Tag } from '@ifhover/leaf-ui';
import { DataTable, type DataTableColumnDef, useDataTable } from '@ifhover/leaf-ui/table';
import { useMemo } from 'react';

export interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
  projects: number;
  active: boolean;
}

export const members: Member[] = Array.from({ length: 26 }, (_, index) => ({
  id: `member-${index + 1}`,
  name:
    ['Alex Morgan', 'Sam Taylor', 'Jordan Lee', 'Riley Chen', 'Casey Wilson', 'Jamie Park'][
      index % 6
    ] ?? '',
  email: `member${index + 1}@example.com`,
  team: ['Design', 'Engineering', 'Product'][index % 3] ?? '',
  projects: ((index * 7) % 18) + 1,
  active: index % 4 !== 2,
}));

export function useMemberColumns(english = false) {
  return useMemo<DataTableColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: english ? 'Member' : '成员',
        size: 230,
        minSize: 160,
        maxSize: 400,
        enableHiding: false,
        cell: ({ row }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar size={24}>{row.original.name.slice(0, 1)}</Avatar>
            <strong>{row.original.name}</strong>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: english ? 'Email' : '邮箱',
        size: 250,
        minSize: 180,
        maxSize: 400,
      },
      {
        accessorKey: 'team',
        header: english ? 'Team' : '团队',
        size: 150,
        minSize: 100,
        maxSize: 240,
      },
      {
        accessorKey: 'projects',
        header: english ? 'Projects' : '项目数',
        size: 110,
        minSize: 90,
        maxSize: 160,
        meta: { align: 'end' },
      },
      {
        accessorKey: 'active',
        header: english ? 'Status' : '状态',
        size: 110,
        minSize: 100,
        maxSize: 160,
        cell: ({ getValue }) => (
          <Tag color={getValue() ? 'success' : 'default'}>
            {getValue() ? (english ? 'Active' : '活跃') : english ? 'Invited' : '已邀请'}
          </Tag>
        ),
      },
    ],
    [english],
  );
}

export function TableData({ english = false }: { english?: boolean }) {
  const columns = useMemberColumns(english);
  const table = useDataTable({
    data: members,
    columns,
    rowKey: 'id',
    options: {
      enableSorting: true,
      initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
      getRowCanExpand: () => true,
      enableRowSelection: (row) => row.original.active,
    },
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? 'Team directory' : '团队成员列表'}
      selection="multiple"
      getRowLabel={(row) => `${row.original.name} (${row.original.id})`}
      renderExpandedRow={(row) => (
        <p style={{ margin: 0 }}>
          {english ? 'Contact' : '联系邮箱'}: {row.original.email} · {english ? 'Team' : '所属团队'}
          : {row.original.team}
        </p>
      )}
      toolbar={
        <>
          <DataTable.Search columnId="name" />
          <span style={{ marginInlineStart: 'auto', color: 'var(--leaf-color-text-muted)' }}>
            {Object.values(table.getState().rowSelection).filter(Boolean).length}{' '}
            {english ? 'selected' : '项已选择'}
          </span>
          <DataTable.ColumnVisibility />
        </>
      }
      pagination={{
        pageSizeOptions: [5, 10, 20],
        showTotal: (total) => (english ? `${total} members` : `共 ${total} 位成员`),
      }}
    />
  );
}

export function TableColumns({ english = false }: { english?: boolean }) {
  const columns = useMemberColumns(english);
  const table = useDataTable({
    data: members,
    columns,
    rowKey: 'id',
    localPagination: false,
    options: {
      enableSorting: false,
      columnResizeMode: 'onChange',
      initialState: { columnPinning: { left: ['name'], right: ['active'] } },
    },
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? 'Pinned and resizable columns' : '固定列与列宽调整'}
      layout="custom"
      maxHeight={300}
      resizable
      pagination={false}
    >
      <DataTable.Toolbar>
        <span style={{ color: 'var(--leaf-color-text-muted)' }}>
          {english
            ? 'Drag a header edge or focus it and use the arrow keys.'
            : '拖动表头右侧边缘，或聚焦边缘后用方向键调整列宽。'}
        </span>
        <Button
          style={{ marginInlineStart: 'auto' }}
          size="sm"
          onClick={() => table.resetColumnSizing()}
        >
          {english ? 'Reset widths' : '重置列宽'}
        </Button>
      </DataTable.Toolbar>
      <DataTable.Content />
    </DataTable>
  );
}
