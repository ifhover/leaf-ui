import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const options: CascaderOption[] = [
  {
    value: 'product',
    label: '产品团队',
    children: [
      { value: 'design', label: '产品体验设计' },
      { value: 'web', label: '前端开发' },
      { value: 'mobile', label: '移动端开发' },
    ],
  },
];

export function CascaderSingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="产品团队">
        <Cascader
          multiple
          tagWrap={false}
          options={options}
          defaultValue={[
            ['product', 'design'],
            ['product', 'web'],
            ['product', 'mobile'],
          ]}
        />
      </FormField>
    </Form>
  );
}
