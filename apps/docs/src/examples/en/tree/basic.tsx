import { Space, Text, Tree } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { treeData } from './data';
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
        <Text tone="muted">Selected: {selected.join(', ') || 'None'}</Text>
      </output>
    </Space>
  );
}
