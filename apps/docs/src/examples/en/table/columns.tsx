import { Table } from '@ifhover/leaf-ui';

const deployments = Array.from({ length: 12 }, (_, index) => ({
  id: `dep-${index + 1}`,
  service: `service-${index + 1}`,
  region: index % 2 === 0 ? 'us-east-1' : 'eu-west-1',
  version: `v2.${index}.0`,
  owner: ['Alex', 'Sam', 'Jordan', 'Riley'][index % 4] ?? '',
  updatedAt: `2026-10-${String(10 + index).padStart(2, '0')} 14:20`,
  status: index % 3 === 0 ? 'Running' : 'Deployed',
}));

export function TableColumns() {
  return (
    <Table
      data={deployments}
      columns={[
        { dataIndex: 'service', title: 'Service', fixed: 'left', width: 140, minWidth: 100 },
        { dataIndex: 'region', title: 'Region', width: 140 },
        { dataIndex: 'version', title: 'Version', width: 140 },
        { dataIndex: 'owner', title: 'Owner', width: 140 },
        { dataIndex: 'updatedAt', title: 'Updated', width: 200 },
        { dataIndex: 'status', title: 'Status', fixed: 'right', width: 110, resizable: false },
      ]}
      rowKey="id"
      aria-label="Pinning and resizing"
      resizable
      maxHeight={260}
      pagination={false}
    />
  );
}
