import { Button, Dropdown, type DropdownItem, useMessage } from '@sudden3/leaf-ui';
import { ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';

const items: DropdownItem[] = [
  { key: 'edit', label: '编辑', icon: <Pencil size={15} /> },
  { key: 'copy', label: '复制', icon: <Copy size={15} /> },
  { key: 'archive', label: '归档', disabled: true },
  { key: 'divider', type: 'divider' },
  { key: 'delete', label: '删除', icon: <Trash2 size={15} />, danger: true },
];
export function DropdownBasic() {
  const { message } = useMessage();
  return (
    <Dropdown items={items} onSelect={(key) => message.info(key)}>
      <Button variant="outline" endIcon={<ChevronDown size={16} />}>
        更多操作
      </Button>
    </Dropdown>
  );
}
