import { Flex, Image, Text } from '@ifhover/leaf-ui';

export function ImageStates() {
  return (
    <Flex direction="column" gap="lg">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Missing image</Text>
        <Image width="100%" height={120} alt="Missing image" />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Load failed</Text>
        <Image
          src="data:image/png;base64,invalid"
          width="100%"
          height={120}
          alt="Image failed to load"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Custom placeholder</Text>
        <Image
          width="100%"
          height={120}
          alt="Image unavailable"
          fallback={<Text tone="muted">Image unavailable</Text>}
        />
      </Flex>
    </Flex>
  );
}
