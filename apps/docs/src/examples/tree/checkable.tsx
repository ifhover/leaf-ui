import { Tree } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { treeData } from './data';
export function TreeCheckable() {
  const [checked, setChecked] = useState<readonly string[]>(['components']);
  return (
    <div className="leaf-demo-stack">
      <Tree
        data={treeData}
        checkable
        selectable={false}
        defaultExpandAll
        showLine
        checkedKeys={checked}
        onCheck={setChecked}
      />
      <output className="leaf-demo-note">勾选节点: {checked.join(', ') || '暂无'}</output>
    </div>
  );
}
