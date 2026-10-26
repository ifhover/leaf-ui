import type { DropdownItem } from '@ifhover/leaf-ui';
import { Button, Dropdown, Flex, Tag, Text } from '@ifhover/leaf-ui';
import { ChevronDown, Copy, Download, Pencil } from 'lucide-react';
import { useState } from 'react';

const items: DropdownItem[] = [
  { key: 'edit', label: '编辑', icon: <Pencil />, extra: <Text tone="muted">Ctrl E</Text> },
  { key: 'copy', label: '复制链接', icon: <Copy />, extra: <Tag size="sm">新</Tag> },
  {
    key: 'export',
    label: '导出',
    icon: <Download />,
    extra: <Text tone="muted">CSV</Text>,
    children: [
      { key: 'all', label: '全部数据' },
      { key: 'selected', label: '当前选择' },
    ],
  },
];

export function DropdownExtra() {
  const [action, setAction] = useState('');
  return (
    <Flex direction="column" gap="md" align="start">
      <Dropdown items={items} onSelect={setAction}>
        <Button variant="outline" endIcon={<ChevronDown size={16} />}>
          更多操作
        </Button>
      </Dropdown>
      {action && <Text role="status">已选择: {action}</Text>}
    </Flex>
  );
}
