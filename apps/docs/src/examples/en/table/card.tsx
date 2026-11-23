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
      title="Team members"
      description="View active members and their assigned projects."
      extra={<Button size="sm">Export</Button>}
      tabs={{
        activeKey: team,
        onChange: setTeam,
        items: [
          { key: 'all', label: 'All' },
          { key: 'Design', label: 'Design' },
          { key: 'Engineering', label: 'Engineering' },
        ],
      }}
      data={filtered}
      columns={[
        { accessorKey: 'name', header: 'Member' },
        { accessorKey: 'team', header: 'Team' },
        { accessorKey: 'projects', header: 'Projects' },
      ]}
      rowKey="id"
      options={{ initialState: { pagination: { pageSize: 3 } } }}
    />
  );
}
