import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

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

export function CascaderSearch() {
  return (
    <Form layout="vertical">
      <FormField label="地区">
        <Cascader options={regions} placeholder="选择地区" showSearch />
      </FormField>
    </Form>
  );
}
