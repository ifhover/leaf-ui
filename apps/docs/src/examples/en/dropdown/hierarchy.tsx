import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownHierarchy() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        onSelect={setAction}
        items={[
          {
            key: 'project',
            type: 'group',
            label: 'Project',
            children: [
              { key: 'open', label: 'Open' },
              {
                key: 'export',
                label: 'Export',
                children: [
                  { key: 'csv', label: 'CSV' },
                  { key: 'json', label: 'JSON' },
                ],
              },
            ],
          },
          { key: 'divider', type: 'divider' },
          { key: 'archive', label: 'Archive', disabled: true },
          { key: 'delete', label: 'Delete', danger: true },
        ]}
      >
        <Button variant="outline">Project actions</Button>
      </Dropdown>
      {action && <Text role="status">Selected: {action}</Text>}
    </Flex>
  );
}
