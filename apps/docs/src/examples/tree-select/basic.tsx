import { TreeSelect, type TreeSelectValue } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { treeOptions } from './options';
export function TreeSelectBasic() {
  const [value, setValue] = useState<TreeSelectValue>(null);
  return (
    <div className="leaf-demo-stack">
      <TreeSelect
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        aria-label="所属团队"
        placeholder="选择所属团队"
      />
      <output className="leaf-demo-note">
        当前值: {typeof value === 'string' ? value : '未选择'}
      </output>
    </div>
  );
}
