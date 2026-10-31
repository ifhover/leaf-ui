import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
];

export function TableSimple() {
  return (
    <DataTable
      striped={false}
      data={members}
      columns={[
        { accessorKey: 'name', header: 'Member' },
        { accessorKey: 'team', header: 'Team' },
        { accessorKey: 'projects', header: 'Projects' },
      ]}
      rowKey="id"
      aria-label="Table with row dividers"
      pagination={false}
    />
  );
}
