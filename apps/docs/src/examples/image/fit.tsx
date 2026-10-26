import { Flex, Image, Text } from '@ifhover/leaf-ui';

const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640"><rect width="960" height="640" fill="#b9d3bf"/><circle cx="480" cy="180" r="72" fill="#fff"/><path d="M0 520L340 250L660 560L960 330V640H0Z" fill="#315242"/></svg>',
)}`;

export function ImageFit() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">裁剪填充（cover）</Text>
        <Image src={source} width="100%" height={160} alt="裁剪显示的山谷" fit="cover" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">完整显示（contain）</Text>
        <Image src={source} width="100%" height={160} alt="完整显示的山谷" fit="contain" />
      </Flex>
    </Flex>
  );
}
