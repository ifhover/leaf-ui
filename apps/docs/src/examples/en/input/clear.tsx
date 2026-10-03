import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');
  return (
    <div className="leaf-demo-stack">
      <Input
        aria-label="Project name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        allowClear
        showCount
        maxLength={30}
      />
      <Input
        aria-label="Keyword"
        defaultValue="Leaf"
        allowClear
        showCount={(text) => `${text.length} characters`}
      />
      <p className="leaf-demo-note">Current text: {value || 'Empty'}</p>
    </div>
  );
}
