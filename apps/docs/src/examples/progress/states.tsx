import { Flex, Progress, Space, Text } from '@ifhover/leaf-ui';
export function ProgressStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>静态进度</Text>
        <Progress percent={45} active={false} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>任务失败</Text>
        <Progress percent={70} status="error" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>任务完成</Text>
        <Progress percent={100} />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>进度暂时无法估计</Text>
        <Progress indeterminate />
      </Flex>
    </Space>
  );
}
