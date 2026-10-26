import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialData: TreeNode[] = [
  {
    key: 'projects',
    title: '项目',
    children: [
      { key: 'design', title: '设计' },
      { key: 'development', title: '开发' },
    ],
  },
  { key: 'archive', title: '归档', children: [{ key: 'draft', title: '草稿' }] },
];

export function TreeDrag() {
  const [data, setData] = useState(initialData);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="项目"
        data={data}
        defaultExpandAll
        draggable
        onDrop={(info) => setData(info.data)}
      />
      <Text role="status" tone="muted">
        调整后的顶层节点：{data.map((node) => node.key).join(', ')}
      </Text>
    </Space>
  );
}
