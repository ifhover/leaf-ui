import { Checkbox, Space } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const people = [
  { name: 'Alex Morgan', team: 'Design' },
  { name: 'Sam Taylor', team: 'Engineering' },
  { name: 'Jordan Lee', team: 'Product' },
];

export function TableAppearance({ english = false }: { english?: boolean }) {
  const [columnDividers, setColumnDividers] = useState(false);
  const [striped, setStriped] = useState(true);
  return (
    <Space direction="vertical" align="stretch">
      <Space wrap>
        <Checkbox
          checked={columnDividers}
          onChange={(event) => setColumnDividers(event.target.checked)}
        >
          {english ? 'Body column dividers' : '表体列分隔线'}
        </Checkbox>
        <Checkbox checked={striped} onChange={(event) => setStriped(event.target.checked)}>
          {english ? 'Striped rows' : '斑马纹'}
        </Checkbox>
      </Space>
      <DataTable
        data={people}
        columns={[
          { accessorKey: 'name', header: english ? 'Member' : '成员' },
          { accessorKey: 'team', header: english ? 'Team' : '团队' },
        ]}
        rowKey="name"
        pagination={false}
        aria-label={english ? 'Table appearance' : '表格外观'}
        columnDividers={columnDividers}
        striped={striped}
      />
    </Space>
  );
}
