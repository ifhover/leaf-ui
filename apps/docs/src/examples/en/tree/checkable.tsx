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

export function TreeCheckable() {
  const [checked, setChecked] = useState<readonly string[]>(['components']);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        data={treeData}
        checkable
        selectable={false}
        defaultExpandAll
        showLine
        checkedKeys={checked}
        onCheck={setChecked}
      />
      <output>
        <Text tone="muted">Checked keys: {checked.join(', ') || 'None'}</Text>
      </output>
    </Space>
  );
}
