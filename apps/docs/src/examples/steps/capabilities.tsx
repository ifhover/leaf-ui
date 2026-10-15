import { Flex, Space, Steps, Text } from '@ifhover/leaf-ui';

const items = [{ title: 'Create' }, { title: 'Review' }, { title: 'Publish' }];
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Dot steps' : '点状步骤'}</Text>
        <Steps progressDot current={1} items={items} />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Progress within the current step' : '当前步骤的进度'}</Text>
        <Steps current={1} percent={65} items={items} />
      </Flex>
    </Space>
  );
}
