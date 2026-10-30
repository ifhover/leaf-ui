import { Button, Card, Flex, Text } from '@ifhover/leaf-ui';
import { DataTable } from '@ifhover/leaf-ui/table';

const members = [
  { id: 'alex', name: 'Alex Morgan', team: '设计', projects: 8 },
  { id: 'sam', name: 'Sam Taylor', team: '工程', projects: 3 },
  { id: 'jordan', name: 'Jordan Lee', team: '产品', projects: 12 },
];

export function CardTable() {
  return (
    <Card
      title="团队成员"
      cover={
        <>
          <Flex
            align="center"
            justify="space-between"
            gap="sm"
            wrap
            style={{ padding: 'var(--leaf-card-padding)' }}
          >
            <Text tone="muted">最近更新</Text>
            <Button size="sm" variant="outline">
              新增成员
            </Button>
          </Flex>
          <DataTable
            variant="simple"
            data={members}
            columns={[
              { accessorKey: 'name', header: '成员' },
              { accessorKey: 'team', header: '团队' },
              { accessorKey: 'projects', header: '项目数' },
            ]}
            rowKey="id"
            aria-label="团队成员"
            pagination={false}
          />
        </>
      }
      footer={
        <Flex justify="space-between" gap="sm" wrap>
          <Text tone="muted">共 3 位成员</Text>
          <Button variant="link">查看全部</Button>
        </Flex>
      }
    />
  );
}
