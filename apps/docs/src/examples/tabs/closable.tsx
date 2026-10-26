import { Button, Flex, type TabItem, Tabs, Text } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';

const initialItems: TabItem[] = [
  { key: '1', label: '标签 1', children: '内容 1', closable: true },
  { key: '2', label: '标签 2', children: '内容 2', closable: true },
];

export function TabsClosable() {
  const nextId = useRef(3);
  const [items, setItems] = useState(initialItems);
  const addTab = () => {
    const key = String(nextId.current++);
    setItems((list) => [
      ...list,
      { key, label: `标签 ${key}`, children: `内容 ${key}`, closable: true },
    ]);
  };
  return (
    <Flex direction="column" gap="md">
      <Tabs
        aria-label="可编辑标签页"
        items={items}
        onAdd={addTab}
        addLabel="新增标签页"
        onClose={(key) => setItems((list) => list.filter((item) => item.key !== key))}
      />
      {items.length === 0 && (
        <Text role="status" tone="muted">
          暂无标签页，恢复后可继续添加。
        </Text>
      )}
      <Flex gap="sm" wrap>
        <Button variant="outline" disabled={items.length === 0} onClick={() => setItems([])}>
          清空标签
        </Button>
        <Button variant="outline" onClick={() => setItems(initialItems)}>
          恢复标签
        </Button>
      </Flex>
    </Flex>
  );
}
