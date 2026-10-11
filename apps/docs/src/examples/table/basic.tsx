import { Button, Space, Table, Tag } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table/tanstack';
import { useState } from 'react';

const simpleColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Team' },
];

const people = [
  { id: '1', name: 'Alex Morgan', email: 'alex@example.com', role: 'Design', active: true },
  { id: '2', name: 'Sam Taylor', email: 'sam@example.com', role: 'Engineering', active: true },
  { id: '3', name: 'Jordan Lee', email: 'jordan@example.com', role: 'Product', active: false },
];

export function TableSimple({ english = false }: { english?: boolean }) {
  return (
    <DataTable
      data={people}
      columns={simpleColumns}
      rowKey="id"
      aria-label={english ? 'Simple data table' : '快捷数据表格'}
      pagination={false}
    />
  );
}

export function TableBasic({ english = false }: { english?: boolean }) {
  return (
    <Table aria-label={english ? 'Team members' : '团队成员'} minWidth={560}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>{english ? 'Member' : '成员'}</Table.ColumnHeader>
          <Table.ColumnHeader>{english ? 'Email' : '邮箱'}</Table.ColumnHeader>
          <Table.ColumnHeader>{english ? 'Team' : '团队'}</Table.ColumnHeader>
          <Table.ColumnHeader>{english ? 'Status' : '状态'}</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {people.map((person) => (
          <Table.Row key={person.id}>
            <Table.Cell>
              <strong>{person.name}</strong>
            </Table.Cell>
            <Table.Cell>{person.email}</Table.Cell>
            <Table.Cell>{person.role}</Table.Cell>
            <Table.Cell>
              <Tag variant="outline" color={person.active ? 'success' : 'default'}>
                {person.active ? (english ? 'Active' : '活跃') : english ? 'Invited' : '已邀请'}
              </Tag>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

export function TableStates({ english = false }: { english?: boolean }) {
  const [state, setState] = useState<'empty' | 'loading' | 'error'>('empty');
  return (
    <Space direction="vertical" align="stretch" style={{ width: '100%' }}>
      <Space wrap>
        <Button variant={state === 'empty' ? 'outline' : 'ghost'} onClick={() => setState('empty')}>
          {english ? 'Empty' : '空数据'}
        </Button>
        <Button
          variant={state === 'loading' ? 'outline' : 'ghost'}
          onClick={() => setState('loading')}
        >
          {english ? 'Loading' : '加载中'}
        </Button>
        <Button variant={state === 'error' ? 'outline' : 'ghost'} onClick={() => setState('error')}>
          {english ? 'Error' : '加载失败'}
        </Button>
      </Space>
      <Table aria-label={english ? 'Data states' : '数据状态'}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{english ? 'Member' : '成员'}</Table.ColumnHeader>
            <Table.ColumnHeader>{english ? 'Team' : '团队'}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {state === 'empty' ? (
            <Table.Empty colSpan={2} />
          ) : state === 'loading' ? (
            <Table.Loading colSpan={2} />
          ) : (
            <Table.Error colSpan={2} onRetry={() => setState('empty')} />
          )}
        </Table.Body>
      </Table>
    </Space>
  );
}
