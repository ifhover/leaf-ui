import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';

const members = Array.from({ length: 26 }, (_, index) => ({
  id: `member-${index + 1}`,
  name: ['Alex Morgan', 'Sam Taylor', 'Jordan Lee'][index % 3] ?? '',
  email: `member${index + 1}@example.com`,
  team: ['Design', 'Engineering', 'Product'][index % 3] ?? '',
  projects: index + 1,
}));
const columns = [
  { accessorKey: 'name', header: 'Member', enableHiding: false },
  { accessorKey: 'team', header: 'Team' },
  { accessorKey: 'projects', header: 'Projects' },
];

export function TableData() {
  const table = useDataTable({
    data: members,
    columns,
    rowKey: 'id',
    options: { initialState: { pagination: { pageIndex: 0, pageSize: 5 } } },
  });
  return (
    <DataTable
      table={table}
      aria-label="Search and column controls"
      toolbar={
        <>
          <DataTable.Search columnId="name" />
          <DataTable.ColumnVisibility />
        </>
      }
      pagination={{ pageSizeOptions: [5, 10, 20] }}
    />
  );
}
