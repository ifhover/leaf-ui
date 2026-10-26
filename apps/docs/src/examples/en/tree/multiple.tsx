import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeData: TreeNode[] = [
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

export function TreeMultiple() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Design resources"
        data={treeData}
        multiple
        defaultExpandAll
        selectedKeys={selected}
        onSelect={setSelected}
      />
      <Text role="status" tone="muted">
        Selected keys: {selected.join(', ') || 'None'}
      </Text>
    </Space>
  );
}
