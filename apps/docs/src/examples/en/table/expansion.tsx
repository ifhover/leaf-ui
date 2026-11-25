import { Table, Text } from '@ifhover/leaf-ui';

const orders = [
  {
    id: 'ORD-01',
    product: 'Mechanical Keyboard',
    total: '$129',
    note: 'Deliver during business hours with invoice included.',
  },
  {
    id: 'ORD-02',
    product: '4K Display',
    total: '$499',
    note: 'Call the recipient before arrival.',
  },
  {
    id: 'ORD-03',
    product: 'Desk Stand',
    total: '$49',
    note: '',
  },
];

export function TableExpansion() {
  return (
    <Table
      data={orders}
      columns={[
        { dataIndex: 'id', title: 'Order' },
        { dataIndex: 'product', title: 'Product' },
        { dataIndex: 'total', title: 'Total', align: 'end' },
      ]}
      rowKey="id"
      aria-label="Expandable orders"
      pagination={false}
      expandable={{
        rowExpandable: (record) => Boolean(record.note),
        expandedRowRender: (record) => <Text tone="muted">Note: {record.note}</Text>,
      }}
    />
  );
}
