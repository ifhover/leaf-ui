import { Flex, Rate, Space, Text } from '@ifhover/leaf-ui';
export function RateStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>只读评分</Text>
        <Rate defaultValue={4} readOnly />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>禁用评分</Text>
        <Rate defaultValue={2} disabled size="sm" />
      </Flex>
    </Space>
  );
}
