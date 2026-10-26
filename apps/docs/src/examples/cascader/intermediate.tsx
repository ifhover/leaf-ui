import { Cascader, type CascaderOption, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州' },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京' },
      { value: 'suzhou', label: '苏州' },
    ],
  },
];

export function CascaderIntermediate() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Form layout="vertical">
      <FormField label="地区">
        <Cascader changeOnSelect options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text role="status" tone="muted">
        选中路径：{JSON.stringify(value)}
      </Text>
    </Form>
  );
}
