import { Cascader, type CascaderOption, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const regions: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
        children: [
          { value: 'xihu', label: '西湖区' },
          { value: 'yuhang', label: '余杭区' },
        ],
      },
      { value: 'ningbo', label: '宁波', children: [{ value: 'haishu', label: '海曙区' }] },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      { value: 'nanjing', label: '南京', children: [{ value: 'gulou', label: '鼓楼区' }] },
      { value: 'suzhou', label: '苏州', children: [{ value: 'gusu', label: '姑苏区' }] },
    ],
  },
  { value: 'archived', label: '归档地区', disabled: true },
];

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Form layout="vertical">
      <FormField label="收货地区">
        <Cascader aria-label="收货地区" options={regions} value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted">选中路径：{value.join(' → ') || '未选择'}</Text>
    </Form>
  );
}
