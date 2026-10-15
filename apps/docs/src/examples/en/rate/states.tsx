import { Flex, Rate, Space, Text } from '@ifhover/leaf-ui';
export function RateStates() {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm">
        <Text>Read-only rating</Text>
        <Rate defaultValue={4} readOnly />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text>Disabled rating</Text>
        <Rate defaultValue={2} disabled size="sm" />
      </Flex>
    </Space>
  );
}
