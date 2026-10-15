import { InputMask, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputMaskBasic() {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <InputMask
        mask="+{86} 000 0000 0000"
        placeholder="+86 138 0000 0000"
        unmask
        value={value}
        onChange={setValue}
        aria-label="电话号码"
      />
      <output>
        <Text tone="muted">原始值: {value || '—'}</Text>
      </output>
    </Space>
  );
}
