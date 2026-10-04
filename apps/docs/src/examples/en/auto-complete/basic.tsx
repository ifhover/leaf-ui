import { AutoComplete } from '@sudden3/leaf-ui';
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
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name</span>
        <AutoComplete
          aria-label="Project name"
          placeholder="Type Leaf or enter any text"
          options={options}
          value={value}
          onChange={setValue}
          onSelect={setSelected}
        />
      </div>
      <span className="leaf-demo-note">
        Input:{value || 'Empty'} · Last selection:{selected || 'None'}
      </span>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled suggestions</span>
        <AutoComplete
          aria-label="Disabled suggestions"
          options={options}
          disabled
          defaultValue="Leaf Garden"
        />
      </div>
    </div>
  );
}
