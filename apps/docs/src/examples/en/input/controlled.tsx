import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Enter and submit">
        <Input
          value={value}
          placeholder="Type and press Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </FormField>
      <Text tone="muted" role="status">
        Submitted: {submitted || 'Waiting for input'}
      </Text>
    </Form>
  );
}
