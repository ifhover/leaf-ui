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
          { accessorKey: 'name', header: 'Member' },
          { accessorKey: 'team', header: 'Team' },
        ]}
        rowKey="id"
        aria-label="Member selection"
        getRowLabel={(row) => row.original.name}
        selection="multiple"
        options={selection.selectionOptions}
        pagination={false}
      />
      <Flex gap="md" align="center" wrap>
        <Text tone="muted">Selected: {selection.selectedRowKeys.length}</Text>
        <Button disabled={!selection.selectedRowKeys.length} onClick={selection.clearSelection}>
          Clear selection
        </Button>
      </Flex>
    </Flex>
  );
}
