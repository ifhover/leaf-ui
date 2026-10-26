import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const options: CascaderOption[] = [
  {
    value: 'design',
    label: '设计',
    children: [
      { value: 'interface', label: '界面设计' },
      { value: 'brand', label: '品牌设计' },
    ],
  },
  {
    value: 'engineering',
    label: '工程',
    children: [
      { value: 'frontend', label: '前端开发' },
      { value: 'backend', label: '后端开发' },
    ],
  },
  { value: 'archived', label: '归档分类', disabled: true },
];

const value = ['design', 'interface'];

export function CascaderStates() {
  return (
    <Form layout="vertical">
      <FormField label="禁用">
        <Cascader options={options} value={value} disabled />
      </FormField>
      <FormField label="只读">
        <Cascader options={options} value={value} readOnly />
      </FormField>
    </Form>
  );
}
