import { Button, Flex, Text } from '@ifhover/leaf-ui';
import { DataTable, useDataTableSelection } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design' },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering' },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product' },
];

export function TableSelection() {
  const selection = useDataTableSelection();
  return (
    <Flex direction="column" gap="md">
      <DataTable
        data={members}
        columns={[
          { accessorKey: 'name', header: '成员' },
          { accessorKey: 'team', header: '团队' },
        ]}
        rowKey="id"
        aria-label="成员选择"
        getRowLabel={(row) => row.original.name}
        selection="multiple"
        options={selection.selectionOptions}
        pagination={false}
      />
      <Flex gap="md" align="center" wrap>
        <Text tone="muted">已选择：{selection.selectedRowKeys.length}</Text>
        <Button disabled={!selection.selectedRowKeys.length} onClick={selection.clearSelection}>
          清空选择
        </Button>
      </Flex>
    </Flex>
  );
}
