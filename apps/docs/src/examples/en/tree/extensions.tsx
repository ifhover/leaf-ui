import { Space, Tree, type TreeNode } from '@sudden3/leaf-ui';
import { useState } from 'react';

const initial: TreeNode[] = [
  { key: 'projects', title: 'Projects', isLeaf: false },
  { key: 'archive', title: 'Archive', children: [{ key: 'draft', title: 'Draft', isLeaf: true }] },
];
export function ExtensionDemo() {
  const [data, setData] = useState(initial);
  return (
    <Space direction="vertical" align="stretch">
      <p>Expand Projects to load children. Move nodes using their handles.</p>
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
            { key: `${node.key}-design`, title: 'Design', isLeaf: true },
            { key: `${node.key}-dev`, title: 'Development', isLeaf: true },
          ];
        }}
        draggable
        onDrop={(info) => setData(info.data)}
      />
      <p>10000 nodes, only visible rows are mounted.</p>
      <Tree
        virtual
        height={240}
        data={Array.from({ length: 10000 }, (_, i) => ({
          key: String(i),
          title: `Node ${i + 1}`,
        }))}
      />
    </Space>
  );
}
