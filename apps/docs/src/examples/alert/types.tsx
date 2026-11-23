import { Alert, Flex, Text } from '@ifhover/leaf-ui';

export function AlertTypes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">默认</Text>
        <Alert title="有新的版本可用" description="刷新页面后即可切换至最新版本。" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">成功</Text>
        <Alert type="success" title="项目已保存" description="所有更改已同步到当前工作区。" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">警告</Text>
        <Alert
          type="warning"
          title="存储空间即将用完"
          description="剩余空间不足 10%，请及时清理历史附件。"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">危险</Text>
        <Alert
          type="danger"
          title="保存失败，请稍后重试"
          description="当前网络连接异常，未能提交你的修改。"
        />
      </Flex>
    </Flex>
  );
}
