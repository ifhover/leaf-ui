import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownContextMenu() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        trigger="contextMenu"
        items={[
          { key: 'edit', label: 'Edit' },
          { key: 'copy', label: 'Copy' },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline">Right-click here</Button>
      </Dropdown>
      {action && <Text role="status">Selected: {action}</Text>}
    </Flex>
  );
}
