import { Flex, Progress, Space, Text } from '@ifhover/leaf-ui';

export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text tone="muted">进行中</Text>
        <Progress percent={45} aria-label="进行中的任务" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">已完成</Text>
        <Progress percent={100} aria-label="已完成的任务" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">失败</Text>
        <Progress percent={70} status="error" aria-label="失败的任务" />
      </Flex>
    </Space>
  );
}
