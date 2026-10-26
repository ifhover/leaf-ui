import { Tag } from '@ifhover/leaf-ui';
import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';
import { type ColumnDef, getGroupedRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';

interface Member {
  id: string;
  name: string;
  team: string;
  projects: number;
}

const members: Member[] = Array.from({ length: 8 }, (_, index) => ({
  id: String(index + 1),
  name: ['Alex', 'Sam', 'Riley'][index % 3] ?? '',
  team: index % 2 ? 'Design' : 'Engineering',
  projects: index + 1,
}));

export function TableGrouped() {
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      { accessorKey: 'team', header: 'Team', size: 150 },
      { accessorKey: 'name', header: 'Member', size: 240 },
      {
        accessorKey: 'projects',
        header: 'Projects',
        aggregationFn: 'sum',
        meta: { align: 'end' },
        aggregatedCell: ({ getValue }) => <Tag>Total: {String(getValue())}</Tag>,
      },
    ],
    [],
  );
  const table = useDataTable({
    data: members,
    columns,
    rowKey: 'id',
    localPagination: false,
    options: {
      getGroupedRowModel: getGroupedRowModel(),
      initialState: { grouping: ['team'], expanded: true },
    },
  });
  return <DataTable table={table} aria-label="Members grouped by team" pagination={false} />;
}
