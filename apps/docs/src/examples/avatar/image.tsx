import { Avatar, Flex, Text } from '@ifhover/leaf-ui';

const portrait = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><title>Alex avatar illustration</title><rect width="100" height="100" fill="#e8efe8"/><path d="M8 100c2-27 17-42 42-42s40 15 42 42" fill="#32744d"/><path d="M36 62h28l-4 14-10 7-10-7z" fill="#e5af85"/><ellipse cx="50" cy="40" rx="22" ry="27" fill="#edc3a0"/><path d="M27 44c-8-30 8-38 23-38 23 0 30 22 23 41l-6-16-5-9c-9 10-20 14-31 14z" fill="#2e3c31"/><path d="M43 54q7 5 14 0" fill="none" stroke="#b1775a" stroke-width="2" stroke-linecap="round"/></svg>',
)}`;

export function AvatarImage() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>圆形图片</Text>
        <Avatar src={portrait} alt="Alex" size="lg" />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>方形图片</Text>
        <Avatar
          src={portrait}
          alt="Alex"
          size={64}
          shape="square"
          imageProps={{ loading: 'lazy' }}
        />
      </Flex>
    </Flex>
  );
}
