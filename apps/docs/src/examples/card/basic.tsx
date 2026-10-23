import { Avatar, AvatarGroup, Card, Flex, Progress, Space, Tag, Text } from '@ifhover/leaf-ui';

export function CardBasic() {
  return (
    <Card
      title="品牌官网改版"
      extra={<Tag color="primary">进行中</Tag>}
      footer={
        <Flex align="center" justify="space-between" gap="sm" wrap>
          <AvatarGroup size="sm">
            <Avatar alt="林晓">林</Avatar>
            <Avatar alt="周宁">周</Avatar>
            <Avatar alt="陈可">陈</Avatar>
          </AvatarGroup>
          <Text tone="muted">2 小时前更新</Text>
        </Flex>
      }
    >
      <Space direction="vertical" align="stretch" size="md">
        <Text tone="muted">用更清晰的内容与一致的视觉，让产品故事更容易被看见。</Text>
        <Flex justify="space-between" gap="sm" wrap>
          <Text strong>项目进度</Text>
          <Text tone="muted">12 / 18 项任务</Text>
        </Flex>
        <Progress percent={67} aria-label="项目进度" />
        <Text tone="muted">下一里程碑 · 周五交付首页设计</Text>
      </Space>
    </Card>
  );
}
