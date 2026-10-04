import { InputOTP } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function InputOTPBasic() {
  const [value, setValue] = useState('');
  const [complete, setComplete] = useState('');
  return (
    <div className="leaf-demo-stack">
      <InputOTP value={value} onChange={setValue} onComplete={setComplete} />
      <output className="leaf-demo-note">已完成: {complete || '—'}</output>
    </div>
  );
}
