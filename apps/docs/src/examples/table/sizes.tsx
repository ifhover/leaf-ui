import { Tabs } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: '1', name: '林晨', team: '设计系统', role: '设计工程师' },
  { id: '2', name: '周远', team: '核心框架', role: '前端架构师' },
  { id: '3', name: '苏禾', team: '用户研究', role: '体验设计师' },
  { id: '4', name: '陈越', team: '研发效能', role: '质量工程师' },
  { id: '5', name: '唐宁', team: '文档工程', role: '技术文档工程师' },
  { id: '6', name: '许诺', team: '视觉设计', role: '交互设计师' },
];

const columns = [
  { accessorKey: 'name', header: '成员' },
  { accessorKey: 'team', header: '团队' },
  { accessorKey: 'role', header: '职责' },
];

const sizeOptions = [
  { key: 'sm', label: '小 (sm)' },
  { key: 'md', label: '中 (md)' },
] as const;

export function TableSizes() {
  return (
    <Tabs
      type="segmented"
      size="sm"
      defaultActiveKey="md"
      aria-label="表格尺寸"
      items={sizeOptions.map(({ key, label }) => ({
        key,
        label,
        children: (
          <DataTable
            size={key}
            data={members}
            columns={columns}
            rowKey="id"
            aria-label={`${label}成员表`}
            options={{ initialState: { pagination: { pageSize: 4 } } }}
          />
        ),
      }))}
    />
  );
}
