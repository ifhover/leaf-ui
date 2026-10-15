import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputControlled() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="Enter and submit">
        <Input
          aria-label="Enter and submit"
          value={value}
          placeholder="Type and press Enter"
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={() => setSubmitted(value)}
        />
      </FormField>
      <Text tone="muted" aria-live="polite">
        Submitted:{submitted || 'Waiting for input'}
      </Text>
    </Form>
  );
}
