import { Space, Text, Tree } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { treeData } from './data';
export function TreeCheckable() {
  const [checked, setChecked] = useState<readonly string[]>(['components']);
  return (
    <Space direction="vertical" align="stretch">
      <Tree
        data={treeData}
        checkable
        selectable={false}
        defaultExpandAll
        showLine
        checkedKeys={checked}
        onCheck={setChecked}
      />
      <output>
        <Text tone="muted">勾选节点: {checked.join(', ') || '暂无'}</Text>
      </output>
    </Space>
  );
}
