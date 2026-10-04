import { Tree } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { treeData } from './data';
export function TreeBasic() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  return (
    <div className="leaf-demo-stack">
      <Tree
        data={treeData}
        defaultExpandedKeys={['design']}
        showIcon
        selectedKeys={selected}
        onSelect={setSelected}
      />
      <output className="leaf-demo-note">已选: {selected.join(', ') || '暂无'}</output>
    </div>
  );
}
