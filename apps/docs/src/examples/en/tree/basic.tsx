import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: 'Design resources',
    children: [
      { key: 'components', title: 'Component guidelines' },
      { key: 'colors', title: 'Brand colors' },
      { key: 'archive', title: 'Archived resources (disabled)', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: 'Engineering',
    children: [
      { key: 'web', title: 'Website' },
      { key: 'mobile', title: 'Mobile app' },
    ],
  },
];

export function TreeBasic() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        data={treeData}
        defaultExpandedKeys={['design']}
        showIcon
        selectedKeys={selected}
        onSelect={setSelected}
      />
      <output>
        <Text tone="muted">Selected: {selected.join(', ') || 'None'}</Text>
      </output>
    </Space>
  );
}
