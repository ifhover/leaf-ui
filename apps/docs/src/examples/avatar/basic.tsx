import { Avatar, Badge, Flex, Text } from '@ifhover/leaf-ui';
export function AvatarBasic() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>小尺寸</Text>
        <Avatar size="sm">LF</Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>默认尺寸</Text>
        <Avatar>LE</Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>大尺寸 · 方形</Text>
        <Avatar size="lg" shape="square">
          UI
        </Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>未读提醒</Text>
        <Badge dot>
          <Avatar alt="未读消息">A</Avatar>
        </Badge>
      </Flex>
    </Flex>
  );
}
