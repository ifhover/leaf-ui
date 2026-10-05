import { Transfer } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function TransferVirtual() {
  const [items] = useState(() =>
    Array.from({ length: 2000 }, (_, index) => ({
      key: String(index),
      label: `Member ${index + 1}`,
      description: index % 2 ? 'Designer' : 'Developer',
    })),
  );
  return <Transfer items={items} virtual height={240} titles={['All members', 'Team members']} />;
}
