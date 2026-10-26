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
        { accessorKey: 'name', header: '成员' },
        { accessorKey: 'team', header: '团队' },
        { accessorKey: 'projects', header: '项目数' },
      ]}
      rowKey="id"
      aria-label="团队成员列表"
      getRowLabel={(row) => `${row.original.name} (${row.original.id})`}
      options={{
        getRowCanExpand: () => true,
        initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
      }}
      renderExpandedRow={(row) => <Text>联系邮箱: {row.original.email}</Text>}
      pagination={{ showSizeChanger: false }}
    />
  );
}
