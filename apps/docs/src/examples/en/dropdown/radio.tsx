import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownRadio() {
  const [view, setView] = useState('list');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        items={[
          {
            key: 'list',
            label: 'List',
            type: 'radio',
            group: 'view',
            checked: view === 'list',
            onCheckedChange: () => setView('list'),
          },
          {
            key: 'grid',
            label: 'Grid',
            type: 'radio',
            group: 'view',
            checked: view === 'grid',
            onCheckedChange: () => setView('grid'),
          },
        ]}
      >
        <Button variant="outline">Change view</Button>
      </Dropdown>
      <Text role="status" tone="muted">
        Current view: {view === 'list' ? 'List' : 'Grid'}
      </Text>
    </Flex>
  );
}
