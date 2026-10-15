import { Flex, Loading, Text } from '@ifhover/leaf-ui';
export function LoadingSizes() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>Small</Text>
        <Loading size="sm" />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Medium</Text>
        <Loading />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Large</Text>
        <Loading size="lg" />
      </Flex>
    </Flex>
  );
}
