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

export function TreeCheckable() {
  const [checked, setChecked] = useState<string[]>(['components']);
  const [halfChecked, setHalfChecked] = useState<readonly string[]>(['design']);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Design resources"
        data={treeData}
        checkable
        selectable={false}
        defaultExpandAll
        checkedKeys={checked}
        onCheck={(keys, info) => {
          setChecked(keys);
          setHalfChecked(info.halfCheckedKeys);
        }}
      />
      <Text role="status" tone="muted">
        Checked keys: {checked.join(', ') || 'None'}
      </Text>
      <Text role="status" tone="muted">
        Mixed keys: {halfChecked.join(', ') || 'None'}
      </Text>
    </Space>
  );
}
