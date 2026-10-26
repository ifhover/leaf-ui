import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="输入并回车">
        <Input
          value={value}
          placeholder="输入后按 Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </FormField>
      <Text tone="muted" role="status">
        已提交：{submitted || '等待输入'}
      </Text>
    </Form>
  );
}
