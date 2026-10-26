import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';

const members = Array.from({ length: 10000 }, (_, index) => ({
  id: String(index + 1),
  name: `Member ${index + 1}`,
  email: `member${index + 1}@example.com`,
  team: index % 2 ? 'Design' : 'Engineering',
}));
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'team', header: 'Team' },
];

export function TableVirtual() {
  const table = useDataTable({ data: members, columns, rowKey: 'id', localPagination: false });
  return (
    <DataTable
      table={table}
      aria-label="10000 members"
      virtual={{ estimateRowHeight: 55, overscan: 6 }}
      maxHeight={320}
      pagination={false}
    />
  );
}
