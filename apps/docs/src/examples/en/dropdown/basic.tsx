import { Button, Dropdown, Flex, Text } from '@ifhover/leaf-ui';
import { Archive, ChevronDown, Copy, Pencil } from 'lucide-react';
import { useState } from 'react';

export function DropdownBasic() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown
        items={[
          { key: 'edit', label: 'Edit', icon: <Pencil size={14} /> },
          { key: 'copy', label: 'Copy', icon: <Copy size={14} /> },
          { key: 'archive', label: 'Archive', icon: <Archive size={14} /> },
        ]}
        onSelect={setAction}
      >
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          More actions
        </Button>
      </Dropdown>
      {action && <Text role="status">Selected: {action}</Text>}
    </Flex>
  );
}
