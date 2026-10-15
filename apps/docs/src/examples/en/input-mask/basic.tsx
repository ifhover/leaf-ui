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
        aria-label="Phone number"
      />
      <output>
        <Text tone="muted">Unmasked value: {value || '—'}</Text>
      </output>
    </Space>
  );
}
