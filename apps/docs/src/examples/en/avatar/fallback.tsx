import { Avatar, Flex, Text } from '@ifhover/leaf-ui';
export function AvatarFallback() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>Text fallback</Text>
        <Avatar src="data:image/png;base64,broken" alt="Failed image">
          LF
        </Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Default icon</Text>
        <Avatar alt="Guest" />
      </Flex>
    </Flex>
  );
}
