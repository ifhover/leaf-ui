import { Card, Flex, Text, VirtualList } from '@ifhover/leaf-ui';

const items = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  name: `项目 ${index + 1}`,
  description: '用于记录项目进展与下一步安排。'.repeat((index % 3) + 1),
}));

export function VirtualListDynamic() {
  return (
    <VirtualList
      items={items}
      itemKey={(item) => item.id}
      height={240}
      estimateSize={96}
      role="region"
      aria-label="动态高度列表"
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
