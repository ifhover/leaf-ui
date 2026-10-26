// Rich component acceptance scenarios live independently of simplified documentation examples.
import { Button, Space, Tag } from '@ifhover/leaf-ui';
import { DataTable, useDataTableSelection } from '@ifhover/leaf-ui/table';
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
        { accessorKey: 'name', header: english ? 'Member' : '成员', size: 160 },
        { accessorKey: 'email', header: english ? 'Email' : '邮箱', size: 240 },
        { accessorKey: 'role', header: english ? 'Team' : '团队', size: 140 },
        {
          accessorKey: 'active',
          header: english ? 'Status' : '状态',
          size: 120,
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
        <Button variant={state === 'empty' ? 'solid' : 'outline'} onClick={() => setState('empty')}>
          {english ? 'Empty' : '空数据'}
        </Button>
        <Button
          variant={state === 'loading' ? 'solid' : 'outline'}
          onClick={() => setState('loading')}
        >
          {english ? 'Loading' : '加载中'}
        </Button>
        <Button variant={state === 'error' ? 'solid' : 'outline'} onClick={() => setState('error')}>
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

export function TableSelection({ english = false }: { english?: boolean }) {
  const selection = useDataTableSelection();
  return (
    <DataTable
      data={people}
      columns={[
        { accessorKey: 'name', header: english ? 'Member' : '成员' },
        { accessorKey: 'role', header: english ? 'Team' : '团队' },
      ]}
      rowKey="id"
      aria-label={english ? 'Member selection' : '成员选择'}
      selection="multiple"
      options={{
        ...selection.selectionOptions,
        initialState: { pagination: { pageIndex: 0, pageSize: 2 } },
      }}
      toolbar={
        <>
          <DataTable.Search columnId="name" />
          <span>
            {selection.selectedRowKeys.length} {english ? 'selected' : '项已选择'}
          </span>
        </>
      }
      pagination={{ showSizeChanger: false }}
    />
  );
}
