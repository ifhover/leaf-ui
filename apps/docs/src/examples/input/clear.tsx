import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="项目名称">
        <Input value={value} onChange={(event) => setValue(event.target.value)} allowClear />
      </FormField>
      <Text tone="muted" role="status">
        当前内容：{value || '未填写'}
      </Text>
    </Form>
  );
}
