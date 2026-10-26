import { Flex, Tag } from '@ifhover/leaf-ui';

export function TagColors() {
  return (
    <Flex gap="sm" wrap>
      <Tag color="primary">主题</Tag>
      <Tag color="success">成功</Tag>
      <Tag color="info">信息</Tag>
      <Tag color="warning">警告</Tag>
      <Tag color="danger">危险</Tag>
      <Tag color="#7654c6">自定义</Tag>
    </Flex>
  );
}
