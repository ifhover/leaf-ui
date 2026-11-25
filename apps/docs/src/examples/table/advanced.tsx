import { Table } from '@ifhover/leaf-ui';

const logs = Array.from({ length: 1000 }, (_, index) => ({
  id: `log-${index + 1}`,
  seq: index + 1,
  service: ['gateway', 'auth', 'billing', 'search'][index % 4] ?? 'gateway',
  message: `请求 #${index + 1} 处理完成`,
}));

export function TableVirtual() {
  return (
    <Table
      data={logs}
      columns={[
        { dataIndex: 'seq', title: '序号', width: 90, align: 'end' },
        { dataIndex: 'service', title: '服务', width: 120 },
        { dataIndex: 'message', title: '日志内容', flex: 1, minWidth: 200 },
      ]}
      rowKey="id"
      aria-label="虚拟滚动日志表"
      virtual={{ estimateRowHeight: 55 }}
      maxHeight={320}
      pagination={false}
    />
  );
}
