import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

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

export function CascaderSearch() {
  return (
    <Form layout="vertical">
      <FormField label="Region">
        <Cascader options={regions} placeholder="Choose a region" showSearch />
      </FormField>
    </Form>
  );
}
