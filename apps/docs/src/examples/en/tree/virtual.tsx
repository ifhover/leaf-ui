import { Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TreeVirtual() {
  const [data] = useState<TreeNode[]>(() =>
    Array.from({ length: 10000 }, (_, index) => ({
      key: String(index),
      title: `Node ${index + 1}`,
    })),
  );
  return <Tree aria-label="Nodes" data={data} virtual height={240} />;
}
