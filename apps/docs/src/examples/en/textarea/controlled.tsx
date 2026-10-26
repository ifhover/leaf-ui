import { Form, FormField, Textarea } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="Message" help={`${value.length} / 120`}>
        <Textarea
          value={value}
          maxLength={120}
          resize="none"
          placeholder="Up to 120 characters"
          onChange={(event) => setValue(event.target.value)}
        />
      </FormField>
    </Form>
  );
}
