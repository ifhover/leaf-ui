import { Button, Flex, Text } from '@ifhover/leaf-ui';

export function FlexAlignment() {
  return (
    <Flex direction="column" gap="lg">
      {(['start', 'center', 'end', 'space-between'] as const).map((justify) => (
        <Flex key={justify} direction="column" gap="sm">
          <Text tone="muted">{justify}</Text>
          <Flex justify={justify} gap="sm" wrap>
            <Button>One</Button>
            <Button>Two</Button>
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}
