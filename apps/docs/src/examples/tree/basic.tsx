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
        <Text tone="muted">已选: {selected.join(', ') || '暂无'}</Text>
      </output>
    </Space>
  );
}
