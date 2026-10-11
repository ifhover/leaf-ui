import { InputMask, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputMaskBasic() {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <InputMask
        mask="+{86} 000 0000 0000"
        placeholder="+86 138 0000 0000"
        unmask
        value={value}
        onChange={setValue}
        aria-label="电话号码"
      />
      <output className="leaf-demo-note">原始值: {value || '—'}</output>
    </Space>
  );
}
