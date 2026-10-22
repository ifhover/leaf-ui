import { Button, CardTitle, Space, Tag } from '@ifhover/leaf-ui';

export function CardStandaloneTitle() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <CardTitle size="sm" description="The component guidelines were updated today.">
        Recent activity
      </CardTitle>
      <CardTitle
        description="Keep project details together so your team can work from the same plan."
        extra={<Tag>In progress</Tag>}
      >
        Project overview
      </CardTitle>
      <CardTitle
        size="lg"
        description="Share design resources and development progress."
        extra={<Button variant="link">View workspace</Button>}
      >
        Team workspace
      </CardTitle>
    </Space>
  );
}
