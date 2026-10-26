import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownContextMenu() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        trigger="contextMenu"
        items={[
          { key: 'edit', label: '编辑' },
          { key: 'copy', label: '复制' },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline">在此右键点击</Button>
      </Dropdown>
      {action && <Text role="status">已选择: {action}</Text>}
    </Flex>
  );
}
