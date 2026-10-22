import type { DropdownItem } from '@ifhover/leaf-ui';
import { Button, Dropdown, Tag } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Download, Pencil } from 'lucide-react';

const items: DropdownItem[] = [
  { key: 'edit', label: '编辑', icon: <Pencil size={15} />, extra: <span>Ctrl E</span> },
  {
    key: 'copy',
    label: '复制链接',
    icon: <Copy size={15} />,
    extra: (
      <Tag size="sm" color="info">
        新
      </Tag>
    ),
  },
  {
    key: 'export',
    label: '导出',
    icon: <Download size={15} />,
    extra: <span>CSV</span>,
    children: [
      { key: 'all', label: '全部数据' },
      { key: 'selected', label: '当前选择' },
    ],
  },
];

export function DropdownExtra() {
  return (
    <Dropdown items={items}>
      <Button variant="outline" endIcon={<ChevronDown size={16} />}>
        更多操作
      </Button>
    </Dropdown>
  );
}
