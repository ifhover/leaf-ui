import { Avatar, Badge, Flex, Text } from '@ifhover/leaf-ui';
export function AvatarBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>Small</Text>
        <Avatar size="sm">LF</Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Medium</Text>
        <Avatar>LE</Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Large · Square</Text>
        <Avatar size="lg" shape="square">
          UI
        </Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Unread indicator</Text>
        <Badge dot>
          <Avatar alt="Unread messages">A</Avatar>
        </Badge>
      </Flex>
    </Flex>
  );
}
