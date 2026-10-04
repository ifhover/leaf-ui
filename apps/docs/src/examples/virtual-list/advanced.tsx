import { Button, VirtualList } from '@sudden3/leaf-ui';
import { useRef, useState } from 'react';
export function VirtualListDynamic() {
  const list = useRef<import('@sudden3/leaf-ui').VirtualListHandle>(null);
  const [items] = useState(() =>
    Array.from({ length: 1000 }, (_, index) => ({
      id: String(index),
      text: '长度不同的内容。 '.repeat((index % 3) + 1),
    })),
  );
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Button variant="outline" onClick={() => list.current?.scrollToIndex(500, 'start')}>
        跳至第 501 项
      </Button>
      <VirtualList
        ref={list}
        items={items}
        itemKey={(item) => item.id}
        height={220}
        estimateSize={60}
        renderItem={(item) => (
          <div style={{ padding: 16 }}>
            <strong>#{item.id}</strong>
            <p style={{ margin: '4px 0' }}>{item.text}</p>
          </div>
        )}
      />
    </div>
  );
}
