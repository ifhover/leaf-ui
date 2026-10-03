import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="leaf-demo-stack">
      <Input
        aria-label="输入并回车"
        value={value}
        placeholder="输入后按 Enter"
        onChange={(event) => setValue(event.target.value)}
        onPressEnter={() => setSubmitted(value)}
      />
      <span className="leaf-demo-note" aria-live="polite">
        已提交：{submitted || '等待输入'}
      </span>
    </div>
  );
}
