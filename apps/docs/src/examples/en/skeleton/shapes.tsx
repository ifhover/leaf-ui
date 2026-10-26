import { Flex, Skeleton, Text } from '@ifhover/leaf-ui';

export function SkeletonShapes() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Default rows</Text>
        <Skeleton avatar />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Rounded rows</Text>
        <Skeleton avatar round />
      </Flex>
    </Flex>
  );
}
