import { Flex, Text, VirtualList } from '@ifhover/leaf-ui';

const items = Array.from({ length: 10000 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

export function VirtualListBasic() {
  return (
    <VirtualList
      items={items}
      itemKey={(item) => item.id}
      height={240}
      estimateSize={44}
      role="region"
      aria-label="Project list"
      renderItem={(item) => (
        <Flex align="center" style={{ height: 44 }}>
          <Text>{item.name}</Text>
        </Flex>
      )}
    />
  );
}
