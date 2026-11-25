import { Button, Flex, Table, type TableKey, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: 'Design', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: 'Engineering', projects: 6 },
  { id: 'taylor', name: 'Taylor Smith', team: 'Product', projects: 4 },
];

export function TableSelection() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<TableKey[]>(['alex']);
  return (
    <Flex direction="column" gap="sm">
      <Flex align="center" gap="sm">
        <Text tone="muted">{selectedRowKeys.length} selected</Text>
        <Button size="sm" disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>
          Clear selection
        </Button>
      </Flex>
      <Table
        data={members}
        columns={[
          { dataIndex: 'name', title: 'Member' },
          { dataIndex: 'team', title: 'Team' },
          { dataIndex: 'projects', title: 'Projects', align: 'end' },
        ]}
        rowKey="id"
        aria-label="Selectable member list"
        pagination={{ defaultPageSize: 3 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
      />
    </Flex>
  );
}
