import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
];

export function TableBasic() {
  return (
    <DataTable
      data={members}
      columns={[
        { accessorKey: 'name', header: '成员' },
        { accessorKey: 'team', header: '团队' },
        { accessorKey: 'projects', header: '项目数' },
      ]}
      rowKey="id"
      aria-label="团队成员"
      pagination={false}
    />
  );
}
