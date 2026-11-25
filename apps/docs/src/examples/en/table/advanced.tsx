import { Table } from '@ifhover/leaf-ui';

const logs = Array.from({ length: 1000 }, (_, index) => ({
  id: `log-${index + 1}`,
  seq: index + 1,
  service: ['gateway', 'auth', 'billing', 'search'][index % 4] ?? 'gateway',
  message: `Request #${index + 1} completed`,
}));

export function TableVirtual() {
  return (
    <Table
      data={logs}
      columns={[
        { dataIndex: 'seq', title: 'Seq', width: 90, align: 'end' },
        { dataIndex: 'service', title: 'Service', width: 120 },
        { dataIndex: 'message', title: 'Message', flex: 1, minWidth: 200 },
      ]}
      rowKey="id"
      aria-label="Virtualized logs"
      virtual={{ estimateRowHeight: 55 }}
      maxHeight={320}
      pagination={false}
    />
  );
}
