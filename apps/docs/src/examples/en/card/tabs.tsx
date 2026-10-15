import { Button, Card, Descriptions, Space } from '@ifhover/leaf-ui';

export function CardTabs() {
  return (
    <Card
      extra={<Button variant="link">View project</Button>}
      tabs={{
        'aria-label': 'Project overview',
        items: [
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <Space direction="vertical" align="stretch" size="md">
                <span>Keep design and development working from the same plan.</span>
                <Descriptions
                  columns={2}
                  items={[
                    { key: 'owner', label: 'Owner', children: 'Rowan Lin' },
                    { key: 'members', label: 'Team members', children: '8 people' },
                  ]}
                />
              </Space>
            ),
          },
          {
            key: 'activity',
            label: 'Activity',
            children: 'Updated the component guidelines and invited two teammates today.',
          },
        ],
      }}
    />
  );
}
