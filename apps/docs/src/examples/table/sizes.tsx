import { Button, Flex, Table } from '@ifhover/leaf-ui';
import { useState } from 'react';

const rows = [
  { id: '1', service: 'API Gateway', latency: '24 ms', status: '正常' },
  { id: '2', service: 'Auth Service', latency: '18 ms', status: '正常' },
  { id: '3', service: 'Search Index', latency: '42 ms', status: '降级' },
  { id: '4', service: 'Billing Worker', latency: '31 ms', status: '正常' },
  { id: '5', service: 'Audit Logger', latency: '15 ms', status: '正常' },
  { id: '6', service: 'Media Proxy', latency: '29 ms', status: '正常' },
];

export function TableSizes() {
  const [size, setSize] = useState<'md' | 'sm'>('md');
  return (
    <Flex direction="column" gap="md">
      <Flex gap="sm">
        <Button variant={size === 'md' ? 'solid' : 'outline'} onClick={() => setSize('md')}>
          默认 md
        </Button>
        <Button variant={size === 'sm' ? 'solid' : 'outline'} onClick={() => setSize('sm')}>
          紧凑 sm
        </Button>
      </Flex>
      <Table
        size={size}
        data={rows}
        columns={[
          { dataIndex: 'service', title: '服务' },
          { dataIndex: 'latency', title: '延迟', align: 'end' },
          { dataIndex: 'status', title: '状态' },
        ]}
        rowKey="id"
        aria-label="不同尺寸表格"
        pagination={{ defaultPageSize: 3 }}
      />
    </Flex>
  );
}
