import { Form, FormField, Input, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function InputClear() {
  const [value, setValue] = useState('Leaf Garden');
  return (
    <Form layout="vertical">
      <FormField label="项目名称">
        <Input
          aria-label="项目名称"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          allowClear
          showCount
          maxLength={30}
        />
      </FormField>
      <FormField label="关键词">
        <Input
          aria-label="关键词"
          defaultValue="Leaf"
          allowClear
          showCount={(text) => `${text.length} 字`}
        />
      </FormField>
      <Text tone="muted">当前内容：{value || '未填写'}</Text>
    </Form>
  );
}
