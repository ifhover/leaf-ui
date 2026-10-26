import { Form, FormField, InputNumber, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputNumberExact() {
  const [value, setValue] = useState<string | null>('9007199254740993.01');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Exact amount">
        <InputNumber
          stringMode
          name="amount"
          value={value}
          onChange={setValue}
          step="0.01"
          precision={2}
        />
      </FormField>
      <Text tone="muted" role="status">
        Current value: {value ?? 'Empty'}
      </Text>
    </Form>
  );
}
