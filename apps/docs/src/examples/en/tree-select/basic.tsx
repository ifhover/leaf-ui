import { Space, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design' },
      { value: 'product', label: 'Product design' },
      { value: 'archive', label: 'Archived team', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    selectable: false,
    children: [
      { value: 'web', label: 'Frontend' },
      { value: 'server', label: 'Backend' },
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
        aria-label="Team"
        placeholder="Select a team"
      />
      <output>
        <Text tone="muted">Current value: {typeof value === 'string' ? value : 'None'}</Text>
      </output>
    </Space>
  );
}
