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
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'projects', header: 'Projects' },
        {
          accessorKey: 'team',
          header: 'Team',
          enableSorting: false,
        },
      ]}
      rowKey="id"
      aria-label="Sortable members"
      options={{ enableSorting: true }}
      pagination={false}
    />
  );
}
