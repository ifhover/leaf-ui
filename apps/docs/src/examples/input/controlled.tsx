import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">输入并回车</span>
        <Input
          aria-label="输入并回车"
          value={value}
          placeholder="输入后按 Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </div>
      <span className="leaf-demo-note" aria-live="polite">
        已提交：{submitted || '等待输入'}
      </span>
    </div>
  );
}
