import { Button, Flex, type TabItem, Tabs, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialItems: TabItem[] = [
  { key: 'one', label: '标签一', children: '内容一' },
  { key: 'two', label: '标签二', children: '内容二' },
  { key: 'three', label: '标签三', children: '内容三' },
];

export function ExtensionDemo() {
  const [items, setItems] = useState(initialItems);
  return (
    <Flex direction="column" gap="md">
      <Tabs aria-label="可排序标签页" items={items} sortable onReorder={setItems} />
      <Text role="status" tone="muted">
        当前顺序：{items.map((item) => item.label).join('、')}
      </Text>
      <Flex>
        <Button variant="outline" onClick={() => setItems(initialItems)}>
          恢复顺序
        </Button>
      </Flex>
    </Flex>
  );
}
