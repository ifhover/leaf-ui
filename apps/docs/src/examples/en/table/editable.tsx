import { Input } from '@ifhover/leaf-ui';
import { DataTable, useDataTable } from '@ifhover/leaf-ui/table';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  team: string;
}

const members: Member[] = Array.from({ length: 3 }, (_, index) => ({
  id: String(index + 1),
  name: ['Alex', 'Sam', 'Riley'][index % 3] ?? '',
  email: `member${index + 1}@example.com`,
  team: index % 2 ? 'Design' : 'Engineering',
}));

export function TableEditable() {
  const [data, setData] = useState(members);
  const columns = useMemo<ColumnDef<Member>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Member',
        size: 240,
        cell: ({ row }) => (
          <Input
            aria-label={`Name: ${row.original.id}`}
            value={row.original.name}
            onChange={(event) => {
              const name = event.currentTarget.value;
              setData((previous) =>
                previous.map((member) =>
                  member.id === row.original.id ? { ...member, name } : member,
                ),
              );
            }}
          />
        ),
      },
      { accessorKey: 'email', header: 'Email', size: 260 },
      { accessorKey: 'team', header: 'Team', size: 140 },
    ],
    [],
  );
  const table = useDataTable({
    data,
    columns,
    rowKey: 'id',
    localPagination: false,
  });
  return <DataTable table={table} aria-label="Editable member names" pagination={false} />;
}
