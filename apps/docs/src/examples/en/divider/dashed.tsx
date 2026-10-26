import { Divider, Flex, Text } from '@ifhover/leaf-ui';

export function DividerDashed() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Solid</Text>
        <Divider />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Dashed</Text>
        <Divider dashed />
      </Flex>
    </Flex>
  );
}
