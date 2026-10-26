import type { DropdownItem } from '@ifhover/leaf-ui';
import { Button, Dropdown, Flex, Tag, Text } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Download, Pencil } from 'lucide-react';
import { useState } from 'react';

const items: DropdownItem[] = [
  { key: 'edit', label: 'Edit', icon: <Pencil />, extra: <Text tone="muted">Ctrl E</Text> },
  { key: 'copy', label: 'Copy link', icon: <Copy />, extra: <Tag size="sm">New</Tag> },
  {
    key: 'export',
    label: 'Export',
    icon: <Download />,
    extra: <Text tone="muted">CSV</Text>,
    children: [
      { key: 'all', label: 'All data' },
      { key: 'selected', label: 'Current selection' },
    ],
  },
];

export function DropdownExtra() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown items={items} onSelect={setAction}>
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          More actions
        </Button>
      </Dropdown>
      {action && <Text role="status">Selected: {action}</Text>}
    </Flex>
  );
}
