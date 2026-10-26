import { Card, Flex, Text, VirtualList } from '@ifhover/leaf-ui';

const items = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
  description: 'Keep track of project updates and the next steps. '.repeat((index % 3) + 1),
}));

export function VirtualListDynamic() {
  return (
    <VirtualList
      items={items}
      itemKey={(item) => item.id}
      height={240}
      estimateSize={96}
      role="region"
      aria-label="Variable-height list"
      renderItem={(item) => (
        <Card size="sm">
          <Flex direction="column" gap="sm">
            <Text>{item.name}</Text>
            <Text tone="muted">{item.description}</Text>
          </Flex>
        </Card>
      )}
    />
  );
}
