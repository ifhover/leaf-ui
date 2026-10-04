import { Sortable } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function SortableGrid() {
  const [items, setItems] = useState([
    { id: 'a', label: 'Alpha' },
    { id: 'fixed', label: 'Cannot drag' },
    { id: 'c', label: 'Charlie' },
    { id: 'd', label: 'Delta' },
  ]);
  return (
    <Sortable
      style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}
      items={items}
      itemKey={(item) => item.id}
      itemDisabled={(item) => item.id === 'fixed'}
      onChange={setItems}
      renderItem={(item, { handle }) => (
        <div
          style={{
            padding: 16,
            background: 'var(--leaf-color-surface-muted)',
            borderRadius: 'var(--leaf-radius)',
          }}
        >
          {handle}
          <p>{item.label}</p>
        </div>
      )}
    />
  );
}
