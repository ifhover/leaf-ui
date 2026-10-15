import { Cascader, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { regions } from './options';

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Form layout="vertical">
      <FormField label="Delivery region">
        <Cascader
          aria-label="Delivery region"
          options={regions}
          value={value}
          onChange={setValue}
        />
      </FormField>
      <Text tone="muted">Selected path:{value.join(' → ') || 'Not selected'}</Text>
    </Form>
  );
}
