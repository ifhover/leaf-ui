import { Button, Card, Flex, Text } from '@ifhover/leaf-ui';

export function FlexCrossAlignment() {
  return (
    <Flex direction="column" gap="lg">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Flex key={align} direction="column" gap="sm">
          <Text tone="muted">{align}</Text>
          <Card size="sm">
            <Flex align={align} gap="sm" style={{ minHeight: 80 }}>
              <Button>One</Button>
              <Button size="lg">Two</Button>
            </Flex>
          </Card>
        </Flex>
      ))}
    </Flex>
  );
}
