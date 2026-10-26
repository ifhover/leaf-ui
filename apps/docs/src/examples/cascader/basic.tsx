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

export function CascaderBasic() {
  return (
    <Form layout="vertical">
      <FormField label="项目分类">
        <Cascader options={options} placeholder="选择项目分类" />
      </FormField>
    </Form>
  );
}
