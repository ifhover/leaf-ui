import { Button } from '@ifhover/leaf-ui';
import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';

const members = Array.from({ length: 26 }, (_, index) => ({
  id: `member-${index + 1}`,
  name: ['Alex Morgan', 'Sam Taylor', 'Jordan Lee'][index % 3] ?? '',
  email: `member${index + 1}@example.com`,
  team: ['Design', 'Engineering', 'Product'][index % 3] ?? '',
  projects: index + 1,
}));
const columns = [
  { accessorKey: 'name', header: '成员', size: 200, minSize: 160, maxSize: 320 },
  { accessorKey: 'email', header: '邮箱', size: 260, minSize: 180, maxSize: 400 },
  { accessorKey: 'team', header: '团队', size: 160, minSize: 120, maxSize: 240 },
  { accessorKey: 'projects', header: '项目数', size: 100, minSize: 80, maxSize: 160 },
];

export function TableColumns() {
  const table = useDataTable({
    data: members,
    columns,
    rowKey: 'id',
    localPagination: false,
    options: {
      columnResizeMode: 'onChange',
      initialState: { columnPinning: { left: ['name'], right: ['projects'] } },
    },
  });
  return (
    <DataTable
      table={table}
      aria-label="固定列与列宽调整"
      layout="custom"
      maxHeight={300}
      resizable
      pagination={false}
    >
      <DataTable.Toolbar>
        <Button onClick={() => table.resetColumnSizing()}>重置列宽</Button>
      </DataTable.Toolbar>
      <DataTable.Content />
    </DataTable>
  );
}
