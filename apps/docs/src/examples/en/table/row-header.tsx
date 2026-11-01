import { Flex, Tag, Text } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const orders = [
  {
    id: '202611010001',
    channel: 'Online store',
    channelColor: 'info',
    createdAt: '2026-11-01 10:30',
    product: 'Travel coffee cup',
    quantity: 2,
    amount: 128,
    status: 'Awaiting shipment',
  },
  {
    id: '202611010002',
    channel: 'Store pickup',
    channelColor: 'success',
    createdAt: '2026-11-01 10:18',
    product: 'Coffee filter papers',
    quantity: 1,
    amount: 36,
    status: 'Completed',
  },
  {
    id: '202611010003',
    channel: 'Online store',
    channelColor: 'info',
    createdAt: '2026-11-01 09:42',
    product: 'Glass coffee server',
    quantity: 1,
    amount: 89,
    status: 'Awaiting shipment',
  },
];

export function TableRowHeader() {
  return (
    <DataTable
      data={orders}
      columns={[
        { accessorKey: 'product', header: 'Product' },
        { accessorKey: 'quantity', header: 'Quantity', meta: { align: 'end' } },
        {
          accessorKey: 'amount',
          header: 'Paid',
          meta: { align: 'end' },
          cell: ({ row }) => `$${row.original.amount.toFixed(2)}`,
        },
        { accessorKey: 'status', header: 'Status' },
      ]}
      rowKey="id"
      aria-label="Orders"
      getRowLabel={(row) => row.original.id}
      bordered
      selection="multiple"
      pagination={false}
      minWidth={620}
      renderRowHeader={(row) => (
        <Flex align="center" justify="space-between" gap="sm" wrap>
          <Flex align="center" gap="sm" wrap>
            <Text strong>Order {row.original.id}</Text>
            <Tag color={row.original.channelColor}>{row.original.channel}</Tag>
          </Flex>
          <Text tone="muted">{row.original.createdAt}</Text>
        </Flex>
      )}
    />
  );
}
