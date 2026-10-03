import { AutoComplete } from '@leaf-ui/react';
import { useState } from 'react';

const options = [
  { value: 'Leaf Garden' },
  { value: 'Leaf Studio' },
  { value: 'Pine Forest' },
  { value: 'Archived Garden', disabled: true },
];

export function AutoCompleteBasic() {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState('');
  return (
    <div className="leaf-demo-stack">
      <AutoComplete
        aria-label="项目名称"
        placeholder="输入 Leaf 或自由填写"
        options={options}
        value={value}
        onChange={setValue}
        onSelect={setSelected}
      />
      <span className="leaf-demo-note">
        输入：{value || '空'} · 最近选中：{selected || '无'}
      </span>
      <AutoComplete aria-label="禁用建议" options={options} disabled defaultValue="Leaf Garden" />
    </div>
  );
}
