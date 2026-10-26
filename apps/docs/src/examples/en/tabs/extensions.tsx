import { Button, Flex, type TabItem, Tabs, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialItems: TabItem[] = [
  { key: 'one', label: 'Tab one', children: 'Content one' },
  { key: 'two', label: 'Tab two', children: 'Content two' },
  { key: 'three', label: 'Tab three', children: 'Content three' },
];

export function ExtensionDemo() {
  const [items, setItems] = useState(initialItems);
  return (
    <Flex direction="column" gap="md">
      <Tabs aria-label="Sortable tabs" items={items} sortable onReorder={setItems} />
      <Text role="status" tone="muted">
        Current order: {items.map((item) => item.label).join(' / ')}
      </Text>
      <Flex>
        <Button variant="outline" onClick={() => setItems(initialItems)}>
          Restore order
        </Button>
      </Flex>
    </Flex>
  );
}
