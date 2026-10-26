import { Form, FormField, InputNumber, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputNumberBasic() {
  const [value, setValue] = useState<number | null>(3);

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="数量">
        <InputNumber name="quantity" min={0} max={20} value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted" role="status">
        当前数量：{value ?? '未填写'}
      </Text>
    </Form>
  );
}
