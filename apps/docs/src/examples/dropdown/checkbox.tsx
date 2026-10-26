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
            label: '显示详情',
            type: 'checkbox',
            checked: details,
            onCheckedChange: setDetails,
          },
        ]}
      >
        <Button variant="outline">显示选项</Button>
      </Dropdown>
      <Text role="status" tone="muted">
        {details ? '详情已显示' : '详情已隐藏'}
      </Text>
    </Flex>
  );
}
