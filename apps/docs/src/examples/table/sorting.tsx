import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex', projects: 8, team: 'Design' },
  { id: 'sam', name: 'Sam', projects: 3, team: 'Engineering' },
  { id: 'riley', name: 'Riley', projects: 12, team: 'Product' },
];

export function TableSorting() {
  return (
    <DataTable
      data={members}
      columns={[
        { accessorKey: 'name', header: '姓名' },
        { accessorKey: 'projects', header: '项目数' },
        {
          accessorKey: 'team',
          header: '团队',
          enableSorting: false,
        },
      ]}
      rowKey="id"
      aria-label="可排序成员"
      options={{ enableSorting: true }}
      pagination={false}
    />
  );
}
