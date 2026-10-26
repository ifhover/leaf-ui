import { Button, Flex, type TabItem, Tabs, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const initialItems: TabItem[] = [
  { key: '1', label: 'Tab 1', children: 'Content 1', closable: true },
  { key: '2', label: 'Tab 2', children: 'Content 2', closable: true },
];

export function TabsClosable() {
  const nextId = useRef(3);
  const [items, setItems] = useState(initialItems);
  const addTab = () => {
    const key = String(nextId.current++);
    setItems((list) => [
      ...list,
      { key, label: `Tab ${key}`, children: `Content ${key}`, closable: true },
    ]);
  };
  return (
    <Flex direction="column" gap="md">
      <Tabs
        aria-label="Editable tabs"
        items={items}
        onAdd={addTab}
        addLabel="Add tab"
        onClose={(key) => setItems((list) => list.filter((item) => item.key !== key))}
      />
      {items.length === 0 && (
        <Text role="status" tone="muted">
          No tabs. Restore them to add more.
        </Text>
      )}
      <Flex gap="sm" wrap>
        <Button variant="outline" disabled={items.length === 0} onClick={() => setItems([])}>
          Clear tabs
        </Button>
        <Button variant="outline" onClick={() => setItems(initialItems)}>
          Restore tabs
        </Button>
      </Flex>
    </Flex>
  );
}
