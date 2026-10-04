import { type TabItem, Tabs } from '@sudden3/leaf-ui';
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
  return (
    <Tabs
      items={items}
      sortable
      onReorder={setItems}
      onAdd={() => {
        const id = String(count.current++);
        setItems((current) => [
          ...current,
          { key: id, label: `Item ${id}`, children: 'New item', closable: true },
        ]);
      }}
      onClose={(key) => setItems((current) => current.filter((item) => item.key !== key))}
    />
  );
}
