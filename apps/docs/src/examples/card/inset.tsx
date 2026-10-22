import { Button, Card, Flex, Tag, Text } from '@ifhover/leaf-ui';

export function CardInset() {
  return (
    <Card
      title="项目进度"
      description="本周工作集中在组件文档和交互验证。"
      extra={<Tag>进行中</Tag>}
      footer={
        <Flex justify="end">
          <Button variant="outline">查看详情</Button>
        </Flex>
      }
      variant="inset"
    >
      <Text>标题和状态位于灰色外层，主要信息展示在白色内嵌内容卡中。</Text>
    </Card>
  );
}
