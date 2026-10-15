import { Button, Space, type TabItem, Tabs } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';
export function TabsClosable() {
  const sequence = useRef(2);
  const [items, setItems] = useState<TabItem[]>([
    { key: '1', label: 'First project', children: 'First project content', closable: true },
    { key: '2', label: 'Second project', children: 'Second project content', closable: true },
  ]);
  const addTab = () => {
    const key = String(++sequence.current);
    setItems((list) => [
      ...list,
      { key, label: `Project ${key}`, children: `Project ${key} content`, closable: true },
    ]);
  };
  return (
    <Space direction="vertical" align="stretch">
      <Tabs
        aria-label="Closable tabs"
        items={items}
        type="card"
        onClose={(key) => setItems((list) => list.filter((item) => item.key !== key))}
        onAdd={addTab}
        addLabel="Add tab"
      />
      {items.length === 0 && (
        <Space>
          <Button variant="outline" onClick={addTab}>
            Add tab
          </Button>
        </Space>
      )}
    </Space>
  );
}
