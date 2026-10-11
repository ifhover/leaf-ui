import { InputOTP, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputOTPBasic() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState('');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <InputOTP value={value} onChange={setValue} onComplete={setComplete} />
      <output className="leaf-demo-note">Completed: {complete || '—'}</output>
    </Space>
  );
}
