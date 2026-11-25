import { Table } from '@ifhover/leaf-ui';

interface Department {
  id: string;
  name: string;
  lead: string;
  headcount: number;
  children?: Department[];
}

const departments: Department[] = [
  {
    id: 'eng',
    name: 'Engineering',
    lead: 'Alex Morgan',
    headcount: 24,
    children: [
      { id: 'eng-fe', name: 'Frontend', lead: 'Sam Taylor', headcount: 10 },
      { id: 'eng-be', name: 'Backend', lead: 'Jordan Lee', headcount: 14 },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    lead: 'Riley Chen',
    headcount: 8,
    children: [{ id: 'design-sys', name: 'Design Systems', lead: 'Casey Kim', headcount: 4 }],
  },
  { id: 'ops', name: 'Operations', lead: 'Taylor Smith', headcount: 6 },
];

export function TableTree() {
  return (
    <Table
      data={departments}
      columns={[
        { dataIndex: 'name', title: 'Department' },
        { dataIndex: 'lead', title: 'Lead' },
        { dataIndex: 'headcount', title: 'Headcount', align: 'end' },
      ]}
      rowKey="id"
      aria-label="Tree table"
      expandable={{ defaultExpandedRowKeys: ['eng'] }}
      pagination={false}
    />
  );
}
