import { Button, Dropdown, type DropdownItem, useMessage } from '@sudden3/leaf-ui';
import { ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';

const items: DropdownItem[] = [
  { key: 'edit', label: 'Edit', icon: <Pencil size={15} /> },
  { key: 'copy', label: 'Copy', icon: <Copy size={15} /> },
  { key: 'archive', label: 'Archive', disabled: true },
  { key: 'divider', type: 'divider' },
  { key: 'delete', label: 'Delete', icon: <Trash2 size={15} />, danger: true },
];
export function DropdownBasic() {
  const { message, contextHolder } = useMessage();
  return (
    <>
      <Dropdown items={items} onSelect={(key) => message.info(key)}>
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          More actions
        </Button>
      </Dropdown>
      {contextHolder}
    </>
  );
}
