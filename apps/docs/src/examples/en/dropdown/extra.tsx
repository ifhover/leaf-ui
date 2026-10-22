import type { DropdownItem } from '@ifhover/leaf-ui';
import { Button, Dropdown, Tag } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Download, Pencil } from 'lucide-react';

const items: DropdownItem[] = [
  { key: 'edit', label: 'Edit', icon: <Pencil size={15} />, extra: <span>Ctrl E</span> },
  {
    key: 'copy',
    label: 'Copy link',
    icon: <Copy size={15} />,
    extra: (
      <Tag size="sm" color="info">
        New
      </Tag>
    ),
  },
  {
    key: 'export',
    label: 'Export',
    icon: <Download size={15} />,
    extra: <span>CSV</span>,
    children: [
      { key: 'all', label: 'All data' },
      { key: 'selected', label: 'Current selection' },
    ],
  },
];

export function DropdownExtra() {
  return (
    <Dropdown items={items}>
      <Button variant="outline" endIcon={<ChevronDown size={16} />}>
        More actions
      </Button>
    </Dropdown>
  );
}
