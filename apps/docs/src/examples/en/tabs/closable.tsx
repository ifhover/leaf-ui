import { Button, type TabItem, Tabs } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function TabsClosable() {
  const sequence = useRef(2);
  const [items, setItems] = useState<TabItem[]>([
    { key: '1', label: 'First project', children: 'First project content', closable: true },
    { key: '2', label: 'Second project', children: 'Second project content', closable: true },
  ]);
  return (
    <div className="leaf-demo-case">
      <span className="leaf-demo-label">Card tabs</span>
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
            Add
          </Button>
        }
      />
    </div>
  );
}
