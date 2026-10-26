import { Space, Text, Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialData: TreeNode[] = [
  {
    key: 'projects',
    title: 'Projects',
    children: [
      { key: 'design', title: 'Design' },
      { key: 'development', title: 'Development' },
    ],
  },
  { key: 'archive', title: 'Archive', children: [{ key: 'draft', title: 'Draft' }] },
];

export function TreeDrag() {
  const [data, setData] = useState(initialData);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        aria-label="Projects"
        data={data}
        defaultExpandAll
        draggable
        onDrop={(info) => setData(info.data)}
      />
      <Text role="status" tone="muted">
        Top-level keys after drop: {data.map((node) => node.key).join(', ')}
      </Text>
    </Space>
  );
}
