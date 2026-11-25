import { Input, Table, type TableColumn } from '@ifhover/leaf-ui';
import { useMemo, useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
}

const initialMembers: Member[] = [
  { id: '1', name: 'Alex', email: 'member1@example.com', team: 'Engineering' },
  { id: '2', name: 'Sam', email: 'member2@example.com', team: 'Design' },
  { id: '3', name: 'Riley', email: 'member3@example.com', team: 'Engineering' },
];

export function TableEditable() {
  const [data, setData] = useState(initialMembers);
  const columns = useMemo<TableColumn<Member>[]>(
    () => [
      {
        dataIndex: 'name',
        title: 'Member',
        width: 240,
        render: (_value, record) => (
          <Input
            aria-label={`Name: ${record.id}`}
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
      { dataIndex: 'email', title: 'Email', width: 260 },
      { dataIndex: 'team', title: 'Team', width: 140 },
    ],
    [],
  );
  return (
    <Table
      data={data}
      columns={columns}
      rowKey="id"
      aria-label="Edit member names"
      pagination={false}
    />
  );
}
