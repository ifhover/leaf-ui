import { Card, Flex, Text } from '@ifhover/leaf-ui';

const sizes = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Default' },
  { size: 'lg', label: 'Large' },
] as const;

export function CardSizes() {
  return (
    <Flex direction="column" gap="lg">
      {sizes.map(({ size, label }) => (
        <Flex key={size} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Card title="Project details" size={size}>
            The same card content.
          </Card>
        </Flex>
      ))}
    </Flex>
  );
}
