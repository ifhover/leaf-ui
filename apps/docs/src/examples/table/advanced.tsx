import { Button, Input, Tag } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table/tanstack';
import {
  type ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  type PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { type Member, members, useMemberColumns } from './data';

const manyMembers: Member[] = Array.from({ length: 10000 }, (_, index) => ({
  ...(members[index % members.length] as Member),
  id: String(index),
  name: `Member ${String(index + 1).padStart(5, '0')}`,
}));
const groupedMembers = members.slice(0, 8);

export function TableVirtual({ english = false }: { english?: boolean }) {
  const columns = useMemberColumns(english);
  const table = useReactTable({
    data: manyMembers,
    columns,
    getRowId: (member) => member.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? '10000 members' : '10000 位成员'}
      virtual={{ estimateRowHeight: 55, overscan: 6 }}
      stickyHeader
      maxHeight={320}
      pagination={false}
    />
  );
}

export function TableServer({ english = false }: { english?: boolean }) {
  const columns = useMemberColumns(english);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const [data, setData] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [request, setRequest] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    const timer = setTimeout(
      () => {
        if (controller.signal.aborted) return;
        setData(
          members.slice(
            pagination.pageIndex * pagination.pageSize,
            (pagination.pageIndex + 1) * pagination.pageSize,
          ),
        );
        setLoading(false);
      },
      request > 0 ? 350 : 500,
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pagination, request]);
  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    manualPagination: true,
    manualSorting: true,
    enableSorting: false,
    rowCount: members.length,
    getRowId: (member) => member.id,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? 'Remote members' : '远程成员'}
      loading={loading}
      error={error ? (english ? 'Unable to load members' : '成员加载失败') : undefined}
      onRetry={() => setRequest((value) => value + 1)}
    >
      <DataTable.Toolbar>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setRequest((value) => value + 1)}
        >
          {english ? 'Refresh' : '刷新'}
        </Button>
        <Button variant="soft" disabled={loading} onClick={() => setError(true)}>
          {english ? 'Simulate error' : '模拟失败'}
        </Button>
      </DataTable.Toolbar>
      <DataTable.Content />
      <DataTable.Footer>
        <DataTable.Pagination pageSizeOptions={[5, 10, 20]} />
      </DataTable.Footer>
    </DataTable>
  );
}

export function TableGrouped({ english = false }: { english?: boolean }) {
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      { accessorKey: 'team', header: english ? 'Team' : '团队', size: 150 },
      { accessorKey: 'name', header: english ? 'Member' : '成员', size: 240 },
      {
        accessorKey: 'projects',
        header: english ? 'Projects' : '项目数',
        aggregationFn: 'sum',
        meta: { align: 'end' },
        aggregatedCell: ({ getValue }) => (
          <Tag>
            {english ? 'Total' : '合计'}: {String(getValue())}
          </Tag>
        ),
      },
    ],
    [english],
  );
  const table = useReactTable({
    data: groupedMembers,
    columns,
    getRowId: (member) => member.id,
    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    initialState: { grouping: ['team'], expanded: true },
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? 'Members grouped by team' : '按团队分组的成员'}
      pagination={false}
    />
  );
}

export function TableEditable({ english = false }: { english?: boolean }) {
  const [data, setData] = useState(members.slice(0, 3));
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: english ? 'Member' : '成员',
        size: 240,
        cell: ({ row }) => (
          <Input
            aria-label={`${english ? 'Name' : '姓名'}: ${row.original.id}`}
            value={row.original.name}
            onChange={(event) => {
              const name = event.currentTarget.value;
              setData((previous) =>
                previous.map((member) =>
                  member.id === row.original.id ? { ...member, name } : member,
                ),
              );
            }}
          />
        ),
      },
      { accessorKey: 'email', header: english ? 'Email' : '邮箱', size: 260 },
      { accessorKey: 'team', header: english ? 'Team' : '团队', size: 140 },
    ],
    [english],
  );
  const table = useReactTable({
    data,
    columns,
    getRowId: (member) => member.id,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <DataTable
      table={table}
      aria-label={english ? 'Editable member names' : '编辑成员姓名'}
      pagination={false}
    />
  );
}
