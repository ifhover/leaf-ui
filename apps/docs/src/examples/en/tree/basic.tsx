import { Space, Tree } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { treeData } from './data';
export function TreeBasic() {
  const [selected, setSelected] = useState<readonly string[]>([]);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Tree
        data={treeData}
        defaultExpandedKeys={['design']}
        showIcon
        selectedKeys={selected}
        onSelect={setSelected}
      />
      <output className="leaf-demo-note">Selected: {selected.join(', ') || 'None'}</output>
    </Space>
  );
}
