import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';

const members = Array.from({ length: 10000 }, (_, index) => ({
  id: String(index + 1),
  name: `成员 ${index + 1}`,
  email: `member${index + 1}@example.com`,
  team: index % 2 ? 'Design' : 'Engineering',
}));
const columns = [
  { accessorKey: 'name', header: '姓名' },
  { accessorKey: 'email', header: '邮箱' },
  { accessorKey: 'team', header: '团队' },
];

export function TableVirtual() {
  const table = useDataTable({ data: members, columns, rowKey: 'id', localPagination: false });
  return (
    <DataTable
      table={table}
      aria-label="10000 位成员"
      virtual={{ estimateRowHeight: 55, overscan: 6 }}
      maxHeight={320}
      pagination={false}
    />
  );
}
