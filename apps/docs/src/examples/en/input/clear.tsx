import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Project name">
        <Input value={value} onChange={(event) => setValue(event.target.value)} allowClear />
      </FormField>
      <Text tone="muted" role="status">
        Current text: {value || 'Empty'}
      </Text>
    </Form>
  );
}
