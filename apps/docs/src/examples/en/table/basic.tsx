import { Table } from '@ifhover/leaf-ui';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: 'Design', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: 'Engineering', projects: 6 },
  { id: 'taylor', name: 'Taylor Smith', team: 'Product', projects: 4 },
];

export function TableBasic() {
  return (
    <Table
      data={members}
      columns={[
        { dataIndex: 'name', title: 'Member' },
        { dataIndex: 'team', title: 'Team' },
        { dataIndex: 'projects', title: 'Projects', align: 'end' },
      ]}
      rowKey="id"
      aria-label="Team members"
      pagination={{ defaultPageSize: 5 }}
    />
  );
}
