import { Table } from '@ifhover/leaf-ui';

const products = [
  {
    sku: 'LF-101',
    name: '静音机械键盘 75%',
    description: '支持热插拔与双模连接，适合长时间代码编写与文档整理。',
    price: '¥799',
  },
  {
    sku: 'LF-102',
    name: '便携 4K 扩展屏',
    description: '单根 Type-C 一线直连，默认校色，适合外出演示与副屏监控。',
    price: '¥1,499',
  },
];

export function TableSizing() {
  return (
    <Table
      data={products}
      columns={[
        { dataIndex: 'sku', title: '编号', width: 100 },
        { dataIndex: 'name', title: '商品名称', flex: 2, minWidth: 140, ellipsis: true },
        { dataIndex: 'description', title: '说明', flex: 1, minWidth: 160, ellipsis: true },
        { dataIndex: 'price', title: '价格', width: 100, align: 'end' },
      ]}
      rowKey="sku"
      aria-label="列宽分配示例"
      pagination={false}
    />
  );
}
