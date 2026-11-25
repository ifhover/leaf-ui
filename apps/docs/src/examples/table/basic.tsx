import { Table } from '@ifhover/leaf-ui';

const members = [
  { id: '1', name: '林澈', team: '设计', projects: 8 },
  { id: '2', name: '周岚', team: '研发', projects: 3 },
  { id: '3', name: '许言', team: '产品', projects: 12 },
  { id: '4', name: '陈宁', team: '设计', projects: 5 },
  { id: '5', name: '苏杭', team: '研发', projects: 6 },
  { id: '6', name: '赵远', team: '产品', projects: 4 },
];

export function TableBasic() {
  return (
    <Table
      data={members}
      columns={[
        { dataIndex: 'name', title: '成员' },
        { dataIndex: 'team', title: '团队' },
        { dataIndex: 'projects', title: '项目数', align: 'end' },
      ]}
      rowKey="id"
      aria-label="团队成员"
      pagination={{ defaultPageSize: 5 }}
    />
  );
}
