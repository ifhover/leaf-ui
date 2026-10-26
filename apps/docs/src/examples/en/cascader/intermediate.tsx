import { Cascader, type CascaderOption, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      { value: 'hangzhou', label: 'Hangzhou' },
      { value: 'ningbo', label: 'Ningbo' },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing' },
      { value: 'suzhou', label: 'Suzhou' },
    ],
  },
];

export function CascaderIntermediate() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form layout="vertical">
      <FormField label="Region">
        <Cascader changeOnSelect options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text role="status" tone="muted">
        Selected path: {JSON.stringify(value)}
      </Text>
    </Form>
  );
}
