import { Button, Space, type TabItem, Tabs } from '@ifhover/leaf-ui';
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
  const addTab = () => {
    const id = String(count.current++);
    setItems((current) => [
      ...current,
      { key: id, label: `项目 ${id}`, children: '新项目', closable: true },
    ]);
  };
  return (
    <Space direction="vertical" align="stretch">
      <Tabs
        aria-label="可排序标签页"
        items={items}
        sortable
        onReorder={setItems}
        onAdd={addTab}
        onClose={(key) => setItems((current) => current.filter((item) => item.key !== key))}
      />
      {items.length === 0 && (
        <Space>
          <Button variant="outline" onClick={addTab}>
            新增标签页
          </Button>
        </Space>
      )}
    </Space>
  );
}
