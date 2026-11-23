import { Button } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: 'Design', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: 'Engineering', projects: 6 },
];

export function TableCard() {
  const [team, setTeam] = useState('all');
  const filtered = team === 'all' ? members : members.filter((member) => member.team === team);

  return (
    <DataTable
      variant="card"
      title="团队成员"
      description="展示当前团队中的成员与参与项目。"
      extra={<Button size="sm">导出</Button>}
      tabs={{
        activeKey: team,
        onChange: setTeam,
        items: [
          { key: 'all', label: '全部' },
          { key: 'Design', label: '设计' },
          { key: 'Engineering', label: '工程' },
        ],
      }}
      data={filtered}
      columns={[
        { accessorKey: 'name', header: '成员' },
        { accessorKey: 'team', header: '团队' },
        { accessorKey: 'projects', header: '项目数' },
      ]}
      rowKey="id"
      options={{ initialState: { pagination: { pageSize: 3 } } }}
    />
  );
}
