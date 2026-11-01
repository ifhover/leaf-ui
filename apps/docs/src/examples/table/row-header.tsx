import { Flex, Tag, Text } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const orders = [
  {
    id: '202611010001',
    channel: '线上商城',
    channelColor: 'info',
    createdAt: '2026-11-01 10:30',
    product: '便携咖啡杯',
    quantity: 2,
    amount: 128,
    status: '待发货',
  },
  {
    id: '202611010002',
    channel: '门店自提',
    channelColor: 'success',
    createdAt: '2026-11-01 10:18',
    product: '手冲滤纸',
    quantity: 1,
    amount: 36,
    status: '已完成',
  },
  {
    id: '202611010003',
    channel: '线上商城',
    channelColor: 'info',
    createdAt: '2026-11-01 09:42',
    product: '玻璃分享壶',
    quantity: 1,
    amount: 89,
    status: '待发货',
  },
];

export function TableRowHeader() {
  return (
    <DataTable
      data={orders}
      columns={[
        { accessorKey: 'product', header: '商品' },
        { accessorKey: 'quantity', header: '数量', meta: { align: 'end' } },
        {
          accessorKey: 'amount',
          header: '实付款',
          meta: { align: 'end' },
          cell: ({ row }) => `¥${row.original.amount.toFixed(2)}`,
        },
        { accessorKey: 'status', header: '状态' },
      ]}
      rowKey="id"
      aria-label="订单列表"
      getRowLabel={(row) => row.original.id}
      bordered
      selection="multiple"
      pagination={false}
      minWidth={620}
      renderRowHeader={(row) => (
        <Flex align="center" justify="space-between" gap="sm" wrap>
          <Flex align="center" gap="sm" wrap>
            <Text strong>订单 {row.original.id}</Text>
            <Tag color={row.original.channelColor}>{row.original.channel}</Tag>
          </Flex>
          <Text tone="muted">{row.original.createdAt}</Text>
        </Flex>
      )}
    />
  );
}
