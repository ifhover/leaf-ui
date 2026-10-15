import { VirtualList } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function VirtualListBasic() {
  const [items] = useState(() =>
    Array.from({ length: 10000 }, (_, index) => ({
      id: String(index),
      name: `Item ${index + 1}`,
    })),
  );
  return (
    <VirtualList
      items={items}
      itemKey={(item) => item.id}
      height={240}
      estimateSize={44}
      renderItem={(item) => <div style={{ padding: '12px 16px' }}>{item.name}</div>}
    />
  );
}
