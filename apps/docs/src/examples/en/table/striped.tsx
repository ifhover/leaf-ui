import { Table } from '@ifhover/leaf-ui';

const tasks = [
  { id: '1', name: 'Color contract review', owner: 'Alex', progress: '100%' },
  { id: '2', name: 'Pagination defaults update', owner: 'Sam', progress: '85%' },
  { id: '3', name: 'Virtual scroll verification', owner: 'Jordan', progress: '60%' },
  { id: '4', name: 'Locale resource check', owner: 'Riley', progress: '40%' },
];

export function TableStriped() {
  return (
    <Table
      striped
      data={tasks}
      columns={[
        { dataIndex: 'name', title: 'Task' },
        { dataIndex: 'owner', title: 'Owner' },
        { dataIndex: 'progress', title: 'Progress', align: 'end' },
      ]}
      rowKey="id"
      aria-label="Striped task table"
      pagination={false}
    />
  );
}
