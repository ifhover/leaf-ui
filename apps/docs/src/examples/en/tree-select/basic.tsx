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
        aria-label="Team"
        placeholder="Select a team"
      />
      <output>
        <Text tone="muted">Current value: {typeof value === 'string' ? value : 'None'}</Text>
      </output>
    </Space>
  );
}
