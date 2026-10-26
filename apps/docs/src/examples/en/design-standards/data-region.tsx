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
        <CardTitle level={2} size="lg" description="View member names and their teams.">
          Team members
        </CardTitle>
        <DataTable
          aria-label="Team members"
          data={visible}
          rowKey="id"
          columns={[
            { accessorKey: 'name', header: 'Member' },
            { accessorKey: 'team', header: 'Team' },
          ]}
          pagination={false}
          toolbar={
            <Flex align="center" gap="sm" wrap>
              <Input
                aria-label="Search members"
                placeholder="Search members"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Text tone="muted" role="status">
                {visible.length} {visible.length === 1 ? 'member' : 'members'}
              </Text>
            </Flex>
          }
        />
      </Flex>
    </Typography>
  );
}
