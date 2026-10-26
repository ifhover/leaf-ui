import { Flex, Skeleton, Text } from '@ifhover/leaf-ui';

export function SkeletonShapes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">默认条目</Text>
        <Skeleton avatar />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">圆角条目</Text>
        <Skeleton avatar round />
      </Flex>
    </Flex>
  );
}
