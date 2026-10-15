import { Space, Text, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { treeOptions } from './options';
export function TreeSelectBasic() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Space direction="vertical" align="stretch">
      <TreeSelect
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        aria-label="所属团队"
        placeholder="选择所属团队"
      />
      <output>
        <Text tone="muted">当前值: {typeof value === 'string' ? value : '未选择'}</Text>
      </output>
    </Space>
  );
}
