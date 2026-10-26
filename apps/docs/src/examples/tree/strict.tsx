import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const treeData: TreeNode[] = [
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

export function TreeStrict() {
  const [checked, setChecked] = useState<string[]>(['components']);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="设计资源"
        data={treeData}
        checkable
        checkStrictly
        selectable={false}
        defaultExpandAll
        checkedKeys={checked}
        onCheck={setChecked}
      />
      <Text role="status" tone="muted">
        勾选节点：{checked.join(', ') || '暂无'}
      </Text>
    </Space>
  );
}
