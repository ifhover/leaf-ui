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
    name: '研发中心',
    lead: '林澈',
    headcount: 24,
    children: [
      { id: 'eng-fe', name: '前端组', lead: '周岚', headcount: 10 },
      { id: 'eng-be', name: '后端组', lead: '许言', headcount: 14 },
    ],
  },
  {
    id: 'design',
    name: '设计中心',
    lead: '陈宁',
    headcount: 8,
    children: [{ id: 'design-sys', name: '设计系统组', lead: '苏杭', headcount: 4 }],
  },
  { id: 'ops', name: '运维保障', lead: '赵远', headcount: 6 },
];

export function TableTree() {
  return (
    <Table
      data={departments}
      columns={[
        { dataIndex: 'name', title: '部门' },
        { dataIndex: 'lead', title: '负责人' },
        { dataIndex: 'headcount', title: '人数', align: 'end' },
      ]}
      rowKey="id"
      aria-label="树形部门表格"
      expandable={{ defaultExpandedRowKeys: ['eng'] }}
      pagination={false}
    />
  );
}
