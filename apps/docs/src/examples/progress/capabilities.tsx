import { Flex, Progress, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Segmented tasks' : '分段任务'}</Text>
        <Progress
          percent={75}
          segments={[
            { key: 'a', percent: 35, color: '#20834a' },
            { key: 'b', percent: 40, color: '#1677ff' },
          ]}
        />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Discrete steps' : '分步进度'}</Text>
        <Progress percent={60} steps={10} />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Dashboard' : '仪表盘'}</Text>
        <Progress type="circle" dashboard percent={65} successPercent={30} />
      </Flex>
    </Space>
  );
}
