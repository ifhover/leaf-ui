import { Divider, Flex, Text } from '@ifhover/leaf-ui';

export function DividerBasic() {
  return (
    <Flex direction="column" gap="sm">
      <Text>Project details</Text>
      <Divider />
      <Text>Team members</Text>
    </Flex>
  );
}
