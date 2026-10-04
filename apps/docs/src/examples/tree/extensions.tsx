import { Space, Tree, type TreeNode } from '@sudden3/leaf-ui';
import { useState } from 'react';

const initial: TreeNode[] = [
  { key: 'projects', title: '项目', isLeaf: false },
  { key: 'archive', title: '归档', children: [{ key: 'draft', title: '草稿', isLeaf: true }] },
];
export function ExtensionDemo() {
  const [data, setData] = useState(initial);
  return (
    <Space direction="vertical" align="stretch">
      <p>展开项目加载子项，通过手柄移动节点。</p>
      <Tree
        data={data}
        loadData={async (node, signal) => {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, 500);
            signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer);
                reject(new DOMException('Aborted', 'AbortError'));
              },
              { once: true },
            );
          });
          return [
            { key: `${node.key}-design`, title: '设计', isLeaf: true },
            { key: `${node.key}-dev`, title: '开发', isLeaf: true },
          ];
        }}
        draggable
        onDrop={(info) => setData(info.data)}
      />
      <p>10000 个节点，仅挂载可视行。</p>
      <Tree
        virtual
        height={240}
        data={Array.from({ length: 10000 }, (_, i) => ({
          key: String(i),
          title: `节点 ${i + 1}`,
        }))}
      />
    </Space>
  );
}
