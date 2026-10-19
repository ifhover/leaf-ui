import { Button, Space, Tag } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const people = [
  { id: '1', name: 'Alex Morgan', email: 'alex@example.com', role: 'Design', active: true },
  { id: '2', name: 'Sam Taylor', email: 'sam@example.com', role: 'Engineering', active: true },
  { id: '3', name: 'Jordan Lee', email: 'jordan@example.com', role: 'Product', active: false },
];

const emptyPeople: typeof people = [];

export function TableBasic({ english = false }: { english?: boolean }) {
  return (
    <DataTable
      data={people}
      columns={[
        { accessorKey: 'name', header: english ? 'Member' : '成员' },
        { accessorKey: 'email', header: english ? 'Email' : '邮箱' },
        { accessorKey: 'role', header: english ? 'Team' : '团队' },
        {
          accessorKey: 'active',
          header: english ? 'Status' : '状态',
          cell: ({ row }) => (
            <Tag color={row.original.active ? 'success' : 'default'}>
              {row.original.active ? (english ? 'Active' : '活跃') : english ? 'Invited' : '已邀请'}
            </Tag>
          ),
        },
      ]}
      rowKey="id"
      aria-label={english ? 'Team members' : '团队成员'}
      minWidth={560}
      pagination={false}
    />
  );
}

export function TableStates({ english = false }: { english?: boolean }) {
  const [state, setState] = useState<'empty' | 'loading' | 'error'>('empty');
  return (
    <Space direction="vertical" align="stretch">
      <Space wrap>
        <Button variant={state === 'empty' ? 'outline' : 'soft'} onClick={() => setState('empty')}>
          {english ? 'Empty' : '空数据'}
        </Button>
        <Button
          variant={state === 'loading' ? 'outline' : 'soft'}
          onClick={() => setState('loading')}
        >
          {english ? 'Loading' : '加载中'}
        </Button>
        <Button variant={state === 'error' ? 'outline' : 'soft'} onClick={() => setState('error')}>
          {english ? 'Error' : '加载失败'}
        </Button>
      </Space>
      <DataTable
        data={emptyPeople}
        columns={[
          { accessorKey: 'name', header: english ? 'Member' : '成员' },
          { accessorKey: 'role', header: english ? 'Team' : '团队' },
        ]}
        rowKey="id"
        aria-label={english ? 'Data states' : '数据状态'}
        pagination={false}
        loading={state === 'loading'}
        error={state === 'error' ? (english ? 'Unable to load members' : '成员加载失败') : null}
        onRetry={() => setState('empty')}
      />
    </Space>
  );
}
