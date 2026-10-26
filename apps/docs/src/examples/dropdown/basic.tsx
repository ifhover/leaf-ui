import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { Archive, ChevronDown, Copy, Pencil } from 'lucide-react';
import { useState } from 'react';

export function DropdownBasic() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        items={[
          { key: 'edit', label: '编辑', icon: <Pencil size={14} /> },
          { key: 'copy', label: '复制', icon: <Copy size={14} /> },
          { key: 'archive', label: '归档', icon: <Archive size={14} /> },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          更多操作
        </Button>
      </Dropdown>
      {action && <Text role="status">已选择: {action}</Text>}
    </Flex>
  );
}
