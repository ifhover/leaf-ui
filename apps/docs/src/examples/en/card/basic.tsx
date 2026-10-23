import { Avatar, AvatarGroup, Card, Flex, Progress, Space, Tag, Text } from '@ifhover/leaf-ui';

export function CardBasic() {
  return (
    <Card
      title="Brand website refresh"
      extra={<Tag color="primary">In progress</Tag>}
      footer={
        <Flex align="center" justify="space-between" gap="sm" wrap>
          <AvatarGroup size="sm">
            <Avatar alt="Lin Xiao">LX</Avatar>
            <Avatar alt="Zhou Ning">ZN</Avatar>
            <Avatar alt="Chen Ke">CK</Avatar>
          </AvatarGroup>
          <Text tone="muted">Updated 2 hours ago</Text>
        </Flex>
      }
    >
      <Space direction="vertical" align="stretch" size="md">
        <Text tone="muted">
          Clearer content and a consistent visual language to tell our story.
        </Text>
        <Flex justify="space-between" gap="sm" wrap>
          <Text strong>Project progress</Text>
          <Text tone="muted">12 / 18 tasks</Text>
        </Flex>
        <Progress percent={67} aria-label="Project progress" />
        <Text tone="muted">Next milestone · Homepage design on Friday</Text>
      </Space>
    </Card>
  );
}
