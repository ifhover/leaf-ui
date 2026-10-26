import { Alert, Flex, Text } from '@ifhover/leaf-ui';

export function AlertTypes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">信息</Text>
        <Alert type="info" title="有新的版本可用" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">成功</Text>
        <Alert type="success" title="项目已保存" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">警告</Text>
        <Alert type="warning" title="存储空间即将用完" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">危险</Text>
        <Alert type="danger" title="保存失败，请稍后重试" />
      </Flex>
    </Flex>
  );
}
