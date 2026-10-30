import { Button, Card, Flex, Text } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: 'Design', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: 'Engineering', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: 'Product', projects: 12 },
];

export function CardTable() {
  return (
    <Card
      title="Team members"
      cover={
        <>
          <Flex
            align="center"
            justify="space-between"
            gap="sm"
            wrap
            style={{ padding: 'var(--leaf-card-padding)' }}
          >
            <Text tone="muted">Recently updated</Text>
            <Button size="sm" variant="outline">
              Add member
            </Button>
          </Flex>
          <DataTable
            variant="simple"
            data={members}
            columns={[
              { accessorKey: 'name', header: 'Name' },
              { accessorKey: 'team', header: 'Team' },
              { accessorKey: 'projects', header: 'Projects' },
            ]}
            rowKey="id"
            aria-label="Team members"
            pagination={false}
          />
        </>
      }
      footer={
        <Flex justify="space-between" gap="sm" wrap>
          <Text tone="muted">3 members</Text>
          <Button variant="link">View all</Button>
        </Flex>
      }
    />
  );
}
