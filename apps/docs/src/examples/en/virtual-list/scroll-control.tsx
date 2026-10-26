import { Button, Flex, Text, VirtualList, type VirtualListHandle } from '@ifhover/leaf-ui';
import { useRef } from 'react';

const items = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

export function VirtualListScrollControl() {
  const list = useRef<VirtualListHandle>(null);
  return (
    <Flex direction="column" gap="md">
      <VirtualList
        ref={list}
        items={items}
        itemKey={(item) => item.id}
        height={240}
        estimateSize={44}
        role="region"
        aria-label="Navigable project list"
        renderItem={(item) => (
          <Flex align="center" style={{ height: 44 }}>
            <Text>{item.name}</Text>
          </Flex>
        )}
      />
      <Flex gap="sm" wrap>
        <Button onClick={() => list.current?.scrollToIndex(500, 'start')}>Go to item 501</Button>
        <Button onClick={() => list.current?.scrollToOffset(0)}>Back to top</Button>
      </Flex>
    </Flex>
  );
}
