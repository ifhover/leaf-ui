import { Flex, Tag, Text } from '@ifhover/leaf-ui';

export function TagVariants() {
  return (
    <Flex direction="column" gap="sm" align="start">
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">soft</Text>
        <Tag>默认</Tag>
        <Tag color="success">成功</Tag>
        <Tag color="info">信息</Tag>
        <Tag color="warning">警告</Tag>
        <Tag color="danger">危险</Tag>
        <Tag color="#722ed1">自定义</Tag>
      </Flex>
      <Flex gap="sm" align="center" wrap>
        <Text tone="muted">solid</Text>
        <Tag variant="solid">默认</Tag>
        <Tag color="success" variant="solid">
          成功
        </Tag>
        <Tag color="info" variant="solid">
          信息
        </Tag>
        <Tag color="warning" variant="solid">
          警告
        </Tag>
        <Tag color="danger" variant="solid">
          危险
        </Tag>
        <Tag color="#722ed1" variant="solid">
          自定义
        </Tag>
      </Flex>
    </Flex>
  );
}
