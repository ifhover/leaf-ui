import { Card, Flex, Text } from '@ifhover/leaf-ui';

const sizes = [
  { size: 'sm', label: '小' },
  { size: 'md', label: '默认' },
  { size: 'lg', label: '大' },
] as const;

export function CardSizes() {
  return (
    <Flex direction="column" gap="lg">
      {sizes.map(({ size, label }) => (
        <Flex key={size} direction="column" gap="sm">
          <Text tone="muted">{label}</Text>
          <Card title="项目资料" size={size}>
            相同的卡片内容。
          </Card>
        </Flex>
      ))}
    </Flex>
  );
}
