import { Textarea } from '@leaf-ui/react';
import { useState } from 'react';

export function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-field">
        <Textarea
          aria-label="留言"
          value={value}
          maxLength={120}
          resize="none"
          placeholder="最多 120 个字符"
          onChange={(event) => setValue(event.target.value)}
        />
        <span className="leaf-demo-note">{value.length} / 120</span>
      </div>
      <Textarea aria-label="错误留言" status="error" placeholder="请补充描述" />
    </div>
  );
}
