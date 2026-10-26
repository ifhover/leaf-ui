import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
];
const columns = [
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'team', header: '团队' },
  { accessorKey: 'projects', header: '项目数' },
];

export function TableReordering() {
  const [data, setData] = useState(members);
  return (
    <DataTable
      data={data}
      columns={columns}
      rowKey="id"
      aria-label="可排序团队"
      getRowLabel={(row) => row.original.name}
      pagination={false}
      columnReordering
      onRowReorder={({ rows }) => setData(rows.map((row) => row.original))}
    />
  );
}
