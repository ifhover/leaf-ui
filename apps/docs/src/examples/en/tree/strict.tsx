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

export function TreeStrict() {
  const [checked, setChecked] = useState<string[]>(['components']);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Design resources"
        data={treeData}
        checkable
        checkStrictly
        selectable={false}
        defaultExpandAll
        checkedKeys={checked}
        onCheck={setChecked}
      />
      <Text role="status" tone="muted">
        Checked keys: {checked.join(', ') || 'None'}
      </Text>
    </Space>
  );
}
