import { Input, Table, type TableColumn } from '@ifhover/leaf-ui';
import { useMemo, useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
}

const initialMembers: Member[] = [
  { id: '1', name: '林澈', email: 'linche@example.com', team: '研发' },
  { id: '2', name: '周岚', email: 'zhoulan@example.com', team: '设计' },
  { id: '3', name: '许言', email: 'xuyan@example.com', team: '研发' },
];

export function TableEditable() {
  const [data, setData] = useState(initialMembers);
  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      {
        dataIndex: 'name',
        title: '成员',
        width: 240,
        render: (_value, record) => (
          <Input
            aria-label={`成员姓名 ${record.id}`}
            value={record.name}
            onChange={(event) => {
              const name = event.currentTarget.value;
              setData((previous) =>
                previous.map((member) => (member.id === record.id ? { ...member, name } : member)),
              );
            }}
          />
        ),
      },
      { dataIndex: 'email', title: '邮箱', width: 260 },
      { dataIndex: 'team', title: '团队', width: 140 },
    ],
    [],
  );
  return (
    <Table data={data} columns={columns} rowKey="id" aria-label="编辑成员姓名" pagination={false} />
  );
}
