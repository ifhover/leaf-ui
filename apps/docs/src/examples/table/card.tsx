import { Card, Input } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: '设计', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: '工程', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: '产品', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: '设计', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: '工程', projects: 6 },
  { id: 'taylor', name: 'Taylor Smith', team: '产品', projects: 4 },
];

export function TableCard() {
  const [query, setQuery] = useState('');
  return (
    <Card title="团队成员">
      <DataTable
        bleed
        toolbar={
          <Input
            aria-label="搜索成员"
            placeholder="搜索成员"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
        }
        data={members.filter((member) => member.name.toLowerCase().includes(query.toLowerCase()))}
        columns={[
          { accessorKey: 'name', header: '成员' },
          { accessorKey: 'team', header: '团队' },
          { accessorKey: 'projects', header: '项目数' },
        ]}
        rowKey="id"
        aria-label="团队成员"
        options={{ initialState: { pagination: { pageSize: 5 } } }}
      />
    </Card>
  );
}
