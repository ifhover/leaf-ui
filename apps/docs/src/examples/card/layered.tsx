import { Card, Flex, Progress, Space, Tag, Text } from '@ifhover/leaf-ui';

export function CardLayered() {
  return (
    <Card title="项目进度" extra={<Tag variant="outline">进行中</Tag>} variant="layered">
      <Space direction="vertical" align="stretch" size="md">
        <Text>整理组件用法，补充交互示例。</Text>
        <Progress percent={60} aria-label="项目完成进度" />
        <Flex justify="space-between" gap="sm" wrap>
          <Text tone="muted">已完成 6 / 10 项任务</Text>
          <Text tone="muted">预计周五完成</Text>
        </Flex>
      </Space>
    </Card>
  );
}
