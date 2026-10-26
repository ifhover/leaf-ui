import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DropdownHover() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        trigger="hover"
        items={[
          { key: 'edit', label: '编辑' },
          { key: 'copy', label: '复制' },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline">悬停展开</Button>
      </Dropdown>
      {action && <Text role="status">已选择: {action}</Text>}
    </Flex>
  );
}
