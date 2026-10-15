import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');
  return (
    <Form layout="vertical">
      <FormField label="Project name">
        <Input
          aria-label="Project name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          allowClear
          showCount
          maxLength={30}
        />
      </FormField>
      <FormField label="Keyword">
        <Input
          aria-label="Keyword"
          defaultValue="Leaf"
          allowClear
          showCount={(text) => `${text.length} characters`}
        />
      </FormField>
      <Text tone="muted">Current text: {value || 'Empty'}</Text>
    </Form>
  );
}
