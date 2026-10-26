import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownCheckbox() {
  const [details, setDetails] = useState(true);
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        items={[
          {
            key: 'details',
            label: 'Show details',
            type: 'checkbox',
            checked: details,
            onCheckedChange: setDetails,
          },
        ]}
      >
        <Button variant="outline">Display options</Button>
      </Dropdown>
      <Text role="status" tone="muted">
        {details ? 'Details are visible' : 'Details are hidden'}
      </Text>
    </Flex>
  );
}
