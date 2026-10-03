import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');
  return (
    <div className="leaf-demo-stack">
      <Input
        aria-label="项目名称"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        allowClear
        showCount
        maxLength={30}
      />
      <Input
        aria-label="关键词"
        defaultValue="Leaf"
        allowClear
        showCount={(text) => `${text.length} 字`}
      />
      <p className="leaf-demo-note">当前内容：{value || '未填写'}</p>
    </div>
  );
}
