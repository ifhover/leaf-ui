import { CardTitle, Flex, Input, Text, Typography } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';
import { useState } from 'react';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design' },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering' },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product' },
];

export function DataRegion() {
  const [search, setSearch] = useState('');
  const visible = members.filter((member) =>
    member.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <Typography>
      <Flex direction="column" gap="md">
        <CardTitle level={2} size="lg" description="查看成员姓名与所属团队。">
          团队成员
        </CardTitle>
        <DataTable
          aria-label="团队成员"
          data={visible}
          rowKey="id"
          columns={[
            { accessorKey: 'name', header: '成员' },
            { accessorKey: 'team', header: '团队' },
          ]}
          pagination={false}
          toolbar={
            <Flex align="center" gap="sm" wrap>
              <Input
                aria-label="搜索成员"
                placeholder="搜索成员"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Text tone="muted" role="status">
                {visible.length} 位成员
              </Text>
            </Flex>
          }
        />
      </Flex>
    </Typography>
  );
}
