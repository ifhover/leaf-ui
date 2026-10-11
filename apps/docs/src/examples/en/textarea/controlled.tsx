import { Space, Textarea } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
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
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Comment error · Error</span>
        <Textarea aria-label="Comment error" status="error" placeholder="Add a description" />
      </div>
    </Space>
  );
}
