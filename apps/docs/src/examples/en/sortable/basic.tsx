import { Sortable } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function SortableBasic() {
  const [items, setItems] = useState([
    { id: 'design', label: 'Design' },
    { id: 'review', label: 'Review' },
    { id: 'publish', label: 'Publish' },
  ]);
  return (
    <Sortable
      style={{ width: 'min(100%, 480px)' }}
      items={items}
      itemKey={(item) => item.id}
      onChange={setItems}
      renderItem={(item, { handle }) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 'var(--leaf-radius)',
            background: 'var(--leaf-color-surface-muted)',
          }}
        >
          {handle}
          <span>{item.label}</span>
        </div>
      )}
    />
  );
}
