import { Table } from '@ifhover/leaf-ui';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
  { id: 'riley', name: 'Riley Chen', team: 'Design', projects: 5 },
  { id: 'casey', name: 'Casey Kim', team: 'Engineering', projects: 9 },
];

export function TableSorting() {
  return (
    <Table
      data={members}
      columns={[
        { dataIndex: 'name', title: 'Member', sorter: true },
        { dataIndex: 'team', title: 'Team', sorter: true },
        {
          dataIndex: 'projects',
          title: 'Projects',
          align: 'end',
          sorter: (a, b) => a.projects - b.projects,
        },
      ]}
      rowKey="id"
      multiSort
      aria-label="Sortable member list"
      pagination={false}
    />
  );
}
