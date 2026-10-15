import { InputOTP, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputOTPBasic() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState('');
  return (
    <Space direction="vertical" align="stretch">
      <InputOTP value={value} onChange={setValue} onComplete={setComplete} />
      <output>
        <Text tone="muted">已完成: {complete || '—'}</Text>
      </output>
    </Space>
  );
}
