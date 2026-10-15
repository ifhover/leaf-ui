import { Flex, Progress, Space, Text } from '@ifhover/leaf-ui';
export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>Static progress</Text>
        <Progress percent={45} active={false} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Task failed</Text>
        <Progress percent={70} status="error" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Task complete</Text>
        <Progress percent={100} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Unknown duration</Text>
        <Progress indeterminate />
      </Flex>
    </Space>
  );
}
