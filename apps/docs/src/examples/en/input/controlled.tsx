import { Input } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="leaf-demo-stack">
      <Input
        aria-label="Enter and submit"
        value={value}
        placeholder="Type and press Enter"
        onChange={(event) => setValue(event.target.value)}
        onPressEnter={() => setSubmitted(value)}
      />
      <span className="leaf-demo-note" aria-live="polite">
        Submitted:{submitted || 'Waiting for input'}
      </span>
    </div>
  );
}
