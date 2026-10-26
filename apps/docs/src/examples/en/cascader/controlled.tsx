import { Cascader, type CascaderOption, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          { value: 'xihu', label: 'Xihu' },
          { value: 'yuhang', label: 'Yuhang' },
        ],
      },
      { value: 'ningbo', label: 'Ningbo', children: [{ value: 'haishu', label: 'Haishu' }] },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing', children: [{ value: 'gulou', label: 'Gulou' }] },
      { value: 'suzhou', label: 'Suzhou', children: [{ value: 'gusu', label: 'Gusu' }] },
    ],
  },
  { value: 'archived', label: 'Archived region', disabled: true },
];

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Form layout="vertical">
      <FormField label="Delivery region">
        <Cascader options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text role="status" tone="muted">
        Selected path: {JSON.stringify(value)}
      </Text>
    </Form>
  );
}
