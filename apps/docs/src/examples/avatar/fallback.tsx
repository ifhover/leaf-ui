import { Avatar, Flex, Text } from '@ifhover/leaf-ui';
export function AvatarFallback() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>加载失败时显示文字</Text>
        <Avatar src="data:image/png;base64,broken" alt="图片加载失败">
          LF
        </Avatar>
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>未设置图片时显示默认图标</Text>
        <Avatar alt="访客" />
      </Flex>
    </Flex>
  );
}
