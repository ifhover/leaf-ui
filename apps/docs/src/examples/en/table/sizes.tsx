import { Tabs } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: '1', name: 'Alex Morgan', team: 'Design Systems', role: 'Design Engineer' },
  { id: '2', name: 'Sam Taylor', team: 'Core Runtime', role: 'Staff Engineer' },
  { id: '3', name: 'Jordan Lee', team: 'Research', role: 'UX Designer' },
  { id: '4', name: 'Riley Chen', team: 'Quality', role: 'QA Engineer' },
  { id: '5', name: 'Casey Kim', team: 'Documentation', role: 'Technical Writer' },
  { id: '6', name: 'Taylor Smith', team: 'Visual Design', role: 'Interaction Designer' },
];

const columns = [
  { accessorKey: 'name', header: 'Member' },
  { accessorKey: 'team', header: 'Team' },
  { accessorKey: 'role', header: 'Role' },
];

const sizeOptions = [
  { key: 'lg', label: 'Large (lg)' },
  { key: 'md', label: 'Medium (md)' },
  { key: 'sm', label: 'Small (sm)' },
] as const;

export function TableSizes() {
  return (
    <Tabs
      type="segmented"
      size="sm"
      defaultActiveKey="lg"
      aria-label="Table size"
      items={sizeOptions.map(({ key, label }) => ({
        key,
        label,
        children: (
          <DataTable
            size={key}
            data={members}
            columns={columns}
            rowKey="id"
            aria-label={`${label} members table`}
            options={{ initialState: { pagination: { pageSize: 4 } } }}
          />
        ),
      }))}
    />
  );
}
