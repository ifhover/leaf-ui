import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="输入并回车">
        <Input
          aria-label="输入并回车"
          value={value}
          placeholder="输入后按 Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </FormField>
      <Text tone="muted" aria-live="polite">
        已提交：{submitted || '等待输入'}
      </Text>
    </Form>
  );
}
