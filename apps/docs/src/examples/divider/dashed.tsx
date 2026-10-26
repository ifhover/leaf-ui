import { Divider, Flex, Text } from '@ifhover/leaf-ui';

export function DividerDashed() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">实线</Text>
        <Divider />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">虚线</Text>
        <Divider dashed />
      </Flex>
    </Flex>
  );
}
