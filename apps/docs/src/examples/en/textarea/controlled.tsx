import { Textarea } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-field">
        <Textarea
          aria-label="Comment"
          value={value}
          maxLength={120}
          resize="none"
          placeholder="Up to 120 characters"
          onChange={(event) => setValue(event.target.value)}
        />
        <span className="leaf-demo-note">{value.length} / 120</span>
      </div>
      <Textarea aria-label="Comment error" status="error" placeholder="Add a description" />
    </div>
  );
}
