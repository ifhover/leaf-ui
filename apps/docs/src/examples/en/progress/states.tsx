import { Flex, Progress, Space, Text } from '@ifhover/leaf-ui';

export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text tone="muted">In progress</Text>
        <Progress percent={45} aria-label="Task in progress" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Complete</Text>
        <Progress percent={100} aria-label="Completed task" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Failed</Text>
        <Progress percent={70} status="error" aria-label="Failed task" />
      </Flex>
    </Space>
  );
}
