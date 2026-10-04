import { type TabItem, Tabs } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function ExtensionDemo() {
  const count = useRef(7);
  const [items, setItems] = useState<TabItem[]>(
    Array.from({ length: 6 }, (_, i) => ({
      key: String(i),
      label: `项目 ${i + 1}`,
      children: `项目 ${i + 1} 内容`,
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
          { key: id, label: `项目 ${id}`, children: '新项目', closable: true },
        ]);
      }}
      onClose={(key) => setItems((current) => current.filter((item) => item.key !== key))}
    />
  );
}
