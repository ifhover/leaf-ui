import { Table } from '@ifhover/leaf-ui';

const deployments = Array.from({ length: 12 }, (_, index) => ({
  id: `dep-${index + 1}`,
  service: `service-${index + 1}`,
  region: index % 2 === 0 ? '华东 1' : '华北 2',
  version: `v2.${index}.0`,
  owner: ['林澈', '周岚', '许言', '陈宁'][index % 4] ?? '',
  updatedAt: `2026-10-${String(10 + index).padStart(2, '0')} 14:20`,
  status: index % 3 === 0 ? '运行中' : '已发布',
}));

export function TableColumns() {
  return (
    <Table
      data={deployments}
      columns={[
        { dataIndex: 'service', title: '服务', fixed: 'left', width: 140, minWidth: 100 },
        { dataIndex: 'region', title: '区域', width: 140 },
        { dataIndex: 'version', title: '版本', width: 140 },
        { dataIndex: 'owner', title: '负责人', width: 140 },
        { dataIndex: 'updatedAt', title: '更新时间', width: 200 },
        { dataIndex: 'status', title: '状态', fixed: 'right', width: 110, resizable: false },
      ]}
      rowKey="id"
      aria-label="固定列与列宽调整"
      resizable
      maxHeight={260}
      pagination={false}
    />
  );
}
