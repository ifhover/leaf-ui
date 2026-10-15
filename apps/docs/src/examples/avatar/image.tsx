import { Avatar, Flex, Text } from '@ifhover/leaf-ui';
export function AvatarImage() {
  const image = '../avatar-portrait.svg';
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>圆形图片</Text>
        <Avatar src={image} alt="Alex" size="lg" />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>方形图片</Text>
        <Avatar src={image} alt="Alex" size={64} shape="square" imageProps={{ loading: 'lazy' }} />
      </Flex>
    </Flex>
  );
}
