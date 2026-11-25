import { Button, Flex, Table } from '@ifhover/leaf-ui';
import { useState } from 'react';

const rows = [
  { id: '1', service: 'API Gateway', latency: '24 ms', status: 'Healthy' },
  { id: '2', service: 'Auth Service', latency: '18 ms', status: 'Healthy' },
  { id: '3', service: 'Search Index', latency: '42 ms', status: 'Degraded' },
  { id: '4', service: 'Billing Worker', latency: '31 ms', status: 'Healthy' },
  { id: '5', service: 'Audit Logger', latency: '15 ms', status: 'Healthy' },
  { id: '6', service: 'Media Proxy', latency: '29 ms', status: 'Healthy' },
];

export function TableSizes() {
  const [size, setSize] = useState<'md' | 'sm'>('md');
  return (
    <Flex direction="column" gap="md">
      <Flex gap="sm">
        <Button variant={size === 'md' ? 'solid' : 'outline'} onClick={() => setSize('md')}>
          Default md
        </Button>
        <Button variant={size === 'sm' ? 'solid' : 'outline'} onClick={() => setSize('sm')}>
          Compact sm
        </Button>
      </Flex>
      <Table
        size={size}
        data={rows}
        columns={[
          { dataIndex: 'service', title: 'Service' },
          { dataIndex: 'latency', title: 'Latency', align: 'end' },
          { dataIndex: 'status', title: 'Status' },
        ]}
        rowKey="id"
        aria-label="Table sizes"
        pagination={{ defaultPageSize: 3 }}
      />
    </Flex>
  );
}
