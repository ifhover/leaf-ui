import { Table } from '@ifhover/leaf-ui';

const products = [
  {
    sku: 'LF-101',
    name: 'Quiet Mechanical Keyboard 75%',
    description: 'Hot-swappable dual-mode keyboard suited for long writing and coding sessions.',
    price: '$129',
  },
  {
    sku: 'LF-102',
    name: 'Portable 4K Monitor',
    description: 'Single-cable USB-C display calibrated out of the box for secondary workflows.',
    price: '$299',
  },
];

export function TableSizing() {
  return (
    <Table
      data={products}
      columns={[
        { dataIndex: 'sku', title: 'SKU', width: 100 },
        { dataIndex: 'name', title: 'Product', flex: 2, minWidth: 140, ellipsis: true },
        { dataIndex: 'description', title: 'Description', flex: 1, minWidth: 160, ellipsis: true },
        { dataIndex: 'price', title: 'Price', width: 100, align: 'end' },
      ]}
      rowKey="sku"
      aria-label="Column sizing"
      pagination={false}
    />
  );
}
