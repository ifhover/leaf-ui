import { Flex, Loading, Text } from '@ifhover/leaf-ui';
export function LoadingSizes() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>小尺寸</Text>
        <Loading size="sm" />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>默认尺寸</Text>
        <Loading />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>大尺寸</Text>
        <Loading size="lg" />
      </Flex>
    </Flex>
  );
}
