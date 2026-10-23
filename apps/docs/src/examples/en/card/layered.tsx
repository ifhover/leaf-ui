import { Card, Flex, Progress, Space, Tag, Text } from '@ifhover/leaf-ui';

export function CardLayered() {
  return (
    <Card
      title="Project progress"
      extra={<Tag variant="outline">In progress</Tag>}
      variant="layered"
    >
      <Space direction="vertical" align="stretch" size="md">
        <Text>
          The content outline is ready. We are adding usage examples and checking the mobile layout.
        </Text>
        <Progress percent={60} aria-label="Project completion" />
        <Flex justify="space-between" gap="sm" wrap>
          <Text tone="muted">6 of 10 tasks completed</Text>
          <Text tone="muted">Due Friday</Text>
        </Flex>
      </Space>
    </Card>
  );
}
