import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Enter and submit</span>
        <Input
          aria-label="Enter and submit"
          value={value}
          placeholder="Type and press Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </div>
      <span className="leaf-demo-note" aria-live="polite">
        Submitted:{submitted || 'Waiting for input'}
      </span>
    </div>
  );
}
