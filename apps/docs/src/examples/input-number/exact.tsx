import { Form, FormField, InputNumber, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputNumberExact() {
  const [value, setValue] = useState<string | null>('9007199254740993.01');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="高精度金额">
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
        当前值：{value ?? '未填写'}
      </Text>
    </Form>
  );
}
