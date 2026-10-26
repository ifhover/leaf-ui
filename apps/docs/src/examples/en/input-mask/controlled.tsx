import { Flex, Form, FormField, InputMask, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputMaskControlled() {
  const [value, setValue] = useState('');
  const [formatted, setFormatted] = useState('');

  return (
    <Form layout="vertical">
      <FormField label="Contact number">
        <InputMask
          mask="000 0000 0000"
          placeholder="138 0000 0000"
          unmask
          allowClear
          value={value}
          onChange={(next, display) => {
            setValue(next);
            setFormatted(display);
          }}
        />
      </FormField>
      <Flex direction="column" gap={8} role="status">
        <Text tone="muted">Value: {value || 'Empty'}</Text>
        <Text tone="muted">Display: {formatted || 'Empty'}</Text>
      </Flex>
    </Form>
  );
}
