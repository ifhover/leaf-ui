import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeData: readonly TreeNode[] = [
  {
    key: 'design',
    title: '设计资源',
    children: [
      { key: 'components', title: '组件规范' },
      { key: 'colors', title: '品牌颜色' },
      { key: 'archive', title: '归档资源（不可选）', disabled: true },
    ],
  },
  {
    key: 'engineering',
    title: '研发项目',
    children: [
      { key: 'web', title: '网站' },
      { key: 'mobile', title: '移动应用' },
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
        <Text tone="muted">勾选节点: {checked.join(', ') || '暂无'}</Text>
      </output>
    </Space>
  );
}
