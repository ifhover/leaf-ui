import { Flex, Transfer, type TransferItem } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TransferVirtual() {
  const [items] = useState<TransferItem[]>(() =>
    Array.from({ length: 2000 }, (_, index) => ({
      key: String(index),
      label: `Member ${index + 1}`,
      description: index % 2 ? 'Designer' : 'Developer',
    })),
  );
  return (
    <Flex justify="center">
      <Transfer items={items} virtual height={240} titles={['All members', 'Team members']} />
    </Flex>
  );
}
