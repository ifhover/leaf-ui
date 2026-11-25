import { Table } from '@ifhover/leaf-ui';

const invoices = [
  { id: 'INV-101', customer: 'Northstar Labs', status: 'Paid', amount: '$12,800' },
  { id: 'INV-102', customer: 'Harbor Studio', status: 'Pending', amount: '$6,400' },
  { id: 'INV-103', customer: 'Clearwater Data', status: 'Paid', amount: '$19,200' },
];

export function TableSimple() {
  return (
    <Table
      bordered
      data={invoices}
      columns={[
        { dataIndex: 'id', title: 'Invoice' },
        { dataIndex: 'customer', title: 'Customer' },
        { dataIndex: 'status', title: 'Status' },
        { dataIndex: 'amount', title: 'Amount', align: 'end' },
      ]}
      rowKey="id"
      aria-label="Bordered invoice table"
      pagination={false}
    />
  );
}
