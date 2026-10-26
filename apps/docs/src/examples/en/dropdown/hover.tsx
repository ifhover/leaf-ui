import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownHover() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        trigger="hover"
        items={[
          { key: 'edit', label: 'Edit' },
          { key: 'copy', label: 'Copy' },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline">Hover to open</Button>
      </Dropdown>
      {action && <Text role="status">Selected: {action}</Text>}
    </Flex>
  );
}
