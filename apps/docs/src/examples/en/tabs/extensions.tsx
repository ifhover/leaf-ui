import { Button, Space, type TabItem, Tabs } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';
export function ExtensionDemo() {
  const count = useRef(7);
  const [items, setItems] = useState<TabItem[]>(
    Array.from({ length: 6 }, (_, i) => ({
      key: String(i),
      label: `Item ${i + 1}`,
      children: `Item ${i + 1} content`,
      closable: true,
    })),
  );
  const addTab = () => {
    const id = String(count.current++);
    setItems((current) => [
      ...current,
      { key: id, label: `Item ${id}`, children: 'New item', closable: true },
    ]);
  };
  return (
    <Space direction="vertical" align="stretch">
      <Tabs
        aria-label="Sortable tabs"
        items={items}
        sortable
        onReorder={setItems}
        onAdd={addTab}
        onClose={(key) => setItems((current) => current.filter((item) => item.key !== key))}
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
