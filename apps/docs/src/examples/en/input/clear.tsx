import { Input, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name</span>
        <Input
          aria-label="Project name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          allowClear
          showCount
          maxLength={30}
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Keyword</span>
        <Input
          aria-label="Keyword"
          defaultValue="Leaf"
          allowClear
          showCount={(text) => `${text.length} characters`}
        />
      </div>
      <p className="leaf-demo-note">Current text: {value || 'Empty'}</p>
    </Space>
  );
}
