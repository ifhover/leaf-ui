import { Table, Text } from '@ifhover/leaf-ui';

const orders = [
  {
    id: 'ORD-01',
    product: '机械键盘',
    total: '¥899',
    note: '工作日白天配送，附带发票。',
  },
  {
    id: 'ORD-02',
    product: '4K 显示器',
    total: '¥2,499',
    note: '请送货前电话联系收件人。',
  },
  {
    id: 'ORD-03',
    product: '桌面支架',
    total: '¥299',
    note: '',
  },
];

export function TableExpansion() {
  return (
    <Table
      data={orders}
      columns={[
        { dataIndex: 'id', title: '订单号' },
        { dataIndex: 'product', title: '商品' },
        { dataIndex: 'total', title: '金额', align: 'end' },
      ]}
      rowKey="id"
      aria-label="可展开订单表格"
      pagination={false}
      expandable={{
        rowExpandable: (record) => Boolean(record.note),
        expandedRowRender: (record) => <Text tone="muted">备注：{record.note}</Text>,
      }}
    />
  );
}
