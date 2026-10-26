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

export function CascaderMultiple() {
  const [value, setValue] = useState<string[][]>([
    ['zhejiang', 'hangzhou'],
    ['jiangsu', 'nanjing'],
  ]);
  return (
    <Form layout="vertical">
      <FormField label="Region">
        <Cascader multiple options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text role="status" tone="muted">
        Selected paths: {value.length}
      </Text>
    </Form>
  );
}
