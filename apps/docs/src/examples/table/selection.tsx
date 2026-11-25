import { Button, Flex, Table, type TableKey, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const members = [
  { id: '1', name: '林澈', team: '设计', projects: 8 },
  { id: '2', name: '周岚', team: '研发', projects: 3 },
  { id: '3', name: '许言', team: '产品', projects: 12 },
  { id: '4', name: '陈宁', team: '设计', projects: 5 },
  { id: '5', name: '苏杭', team: '研发', projects: 6 },
  { id: '6', name: '赵远', team: '产品', projects: 4 },
];

export function TableSelection() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<TableKey[]>(['1']);
  return (
    <Flex direction="column" gap="sm">
      <Flex align="center" gap="sm">
        <Text tone="muted">已选 {selectedRowKeys.length} 项</Text>
        <Button size="sm" disabled={!selectedRowKeys.length} onClick={() => setSelectedRowKeys([])}>
          清空选择
        </Button>
      </Flex>
      <Table
        data={members}
        columns={[
          { dataIndex: 'name', title: '成员' },
          { dataIndex: 'team', title: '团队' },
          { dataIndex: 'projects', title: '项目数', align: 'end' },
        ]}
        rowKey="id"
        aria-label="可选择成员列表"
        pagination={{ defaultPageSize: 3 }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
      />
    </Flex>
  );
}
