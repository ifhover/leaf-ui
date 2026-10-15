import { Button, Space, type TabItem, Tabs } from '@ifhover/leaf-ui';
import { useRef, useState } from 'react';
export function TabsClosable() {
  const sequence = useRef(2);
  const [items, setItems] = useState<TabItem[]>([
    { key: '1', label: '项目一', children: '项目一的内容', closable: true },
    { key: '2', label: '项目二', children: '项目二的内容', closable: true },
  ]);
  const addTab = () => {
    const key = String(++sequence.current);
    setItems((list) => [
      ...list,
      { key, label: `项目 ${key}`, children: `项目 ${key} 的内容`, closable: true },
    ]);
  };
  return (
    <Space direction="vertical" align="stretch">
      <Tabs
        aria-label="可关闭标签页"
        items={items}
        type="card"
        onClose={(key) => setItems((list) => list.filter((item) => item.key !== key))}
        onAdd={addTab}
        addLabel="新增标签页"
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
