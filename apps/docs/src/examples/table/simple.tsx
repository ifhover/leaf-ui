import { Table } from '@ifhover/leaf-ui';

const invoices = [
  { id: 'INV-101', customer: '林深科技', status: '已支付', amount: '¥12,800' },
  { id: 'INV-102', customer: '明远设计', status: '待核销', amount: '¥6,400' },
  { id: 'INV-103', customer: '清风数据', status: '已支付', amount: '¥19,200' },
];

export function TableSimple() {
  return (
    <Table
      bordered
      data={invoices}
      columns={[
        { dataIndex: 'id', title: '单号' },
        { dataIndex: 'customer', title: '客户' },
        { dataIndex: 'status', title: '状态' },
        { dataIndex: 'amount', title: '金额', align: 'end' },
      ]}
      rowKey="id"
      aria-label="带边框账单表格"
      pagination={false}
    />
  );
}
