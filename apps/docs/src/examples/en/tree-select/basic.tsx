import { TreeSelect } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { treeOptions } from './options';
export function TreeSelectBasic() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="leaf-demo-stack">
      <TreeSelect
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        aria-label="Team"
        placeholder="Select a team"
      />
      <output className="leaf-demo-note">
        Current value: {typeof value === 'string' ? value : 'None'}
      </output>
    </div>
  );
}
