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
            label: '列表',
            type: 'radio',
            group: 'view',
            checked: view === 'list',
            onCheckedChange: () => setView('list'),
          },
          {
            key: 'grid',
            label: '网格',
            type: 'radio',
            group: 'view',
            checked: view === 'grid',
            onCheckedChange: () => setView('grid'),
          },
        ]}
      >
        <Button variant="outline">切换视图</Button>
      </Dropdown>
      <Text role="status" tone="muted">
        当前视图: {view === 'list' ? '列表' : '网格'}
      </Text>
    </Flex>
  );
}
