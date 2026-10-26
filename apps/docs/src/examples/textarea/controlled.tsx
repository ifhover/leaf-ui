import { Form, FormField, Textarea } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="留言" help={`${value.length} / 120`}>
        <Textarea
          value={value}
          maxLength={120}
          resize="none"
          placeholder="最多 120 个字符"
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
    </Form>
  );
}
