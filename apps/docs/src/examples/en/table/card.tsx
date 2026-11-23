import { Button, Input } from '@ifhover/leaf-ui';
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
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const filtered = members.filter(
    (member) =>
      (team === 'all' || member.team === team) &&
      (!keyword || member.name.toLowerCase().includes(keyword)),
  );

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
      topContent={
        <Input
          placeholder="Filter by member name"
          aria-label="Filter by member name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      }
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
