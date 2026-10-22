import { Space, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: '设计团队',
    selectable: false,
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'product', label: '产品设计' },
      { value: 'archive', label: '归档团队', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: '研发团队',
    selectable: false,
    children: [
      { value: 'web', label: '前端开发' },
      { value: 'server', label: '服务端开发' },
    ],
  },
];

export function TreeSelectBasic() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Space direction="vertical" align="stretch">
      <TreeSelect
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        aria-label="所属团队"
        placeholder="选择所属团队"
      />
      <output>
        <Text tone="muted">当前值: {typeof value === 'string' ? value : '未选择'}</Text>
      </output>
    </Space>
  );
}
