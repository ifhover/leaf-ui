import { Text } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const members = Array.from({ length: 26 }, (_, index) => ({
  id: `member-${index + 1}`,
  name: ['Alex Morgan', 'Sam Taylor', 'Jordan Lee'][index % 3] ?? '',
  email: `member${index + 1}@example.com`,
  team: ['Design', 'Engineering', 'Product'][index % 3] ?? '',
  projects: index + 1,
}));

export function TableExpansion() {
  return (
    <DataTable
      data={members}
      columns={[
        { accessorKey: 'name', header: 'Member' },
        { accessorKey: 'team', header: 'Team' },
        { accessorKey: 'projects', header: 'Projects' },
      ]}
      rowKey="id"
      aria-label="Team directory"
      getRowLabel={(row) => `${row.original.name} (${row.original.id})`}
      options={{
        getRowCanExpand: () => true,
        initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
      }}
      renderExpandedRow={(row) => <Text>Email: {row.original.email}</Text>}
      pagination={{ showSizeChanger: false }}
    />
  );
}
