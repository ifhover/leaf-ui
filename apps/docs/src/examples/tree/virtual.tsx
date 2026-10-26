import { Tree, type TreeNode } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TreeVirtual() {
  const [data] = useState<TreeNode[]>(() =>
    Array.from({ length: 10000 }, (_, index) => ({
      key: String(index),
      title: `节点 ${index + 1}`,
    })),
  );
  return <Tree aria-label="节点" data={data} virtual height={240} />;
}
