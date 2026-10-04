import { Button, type TabItem, Tabs } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function TabsClosable() {
  const sequence = useRef(2);
  const [items, setItems] = useState<TabItem[]>([
    { key: '1', label: '项目一', children: '项目一的内容', closable: true },
    { key: '2', label: '项目二', children: '项目二的内容', closable: true },
  ]);
  return (
    <div className="leaf-demo-case">
      <span className="leaf-demo-label">卡片标签</span>
      <Tabs
        items={items}
        type="card"
        onClose={(key) => setItems((list) => list.filter((item) => item.key !== key))}
        extra={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const key = String(++sequence.current);
              setItems((list) => [
                ...list,
                { key, label: `Project ${key}`, children: `Project ${key}`, closable: true },
              ]);
            }}
          >
            新增
          </Button>
        }
      />
    </div>
  );
}
