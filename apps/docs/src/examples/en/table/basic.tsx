import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: 'Design', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: 'Engineering', projects: 6 },
  { id: 'taylor', name: 'Taylor Smith', team: 'Product', projects: 4 },
];

export function TableBasic() {
  return (
    <DataTable
      data={members}
      columns={[
        { accessorKey: 'name', header: 'Member' },
        { accessorKey: 'team', header: 'Team' },
        { accessorKey: 'projects', header: 'Projects' },
      ]}
      rowKey="id"
      aria-label="Team members"
      options={{ initialState: { pagination: { pageSize: 5 } } }}
    />
  );
}
