import { Flex, Image, Text } from '@ifhover/leaf-ui';

export function ImageStates() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">未提供图片</Text>
        <Image width="100%" height={120} alt="未提供图片" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">加载失败</Text>
        <Image src="data:image/png;base64,invalid" width="100%" height={120} alt="图片加载失败" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">自定义占位</Text>
        <Image
          width="100%"
          height={120}
          alt="图片暂不可用"
          fallback={<Text tone="muted">图片暂不可用</Text>}
        />
      </Flex>
    </Flex>
  );
}
