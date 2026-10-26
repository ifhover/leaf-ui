import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const options: CascaderOption[] = [
  {
    value: 'product',
    label: 'Product team',
    children: [
      { value: 'design', label: 'Product experience design' },
      { value: 'web', label: 'Frontend development' },
      { value: 'mobile', label: 'Mobile development' },
    ],
  },
];

export function CascaderSingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="Product team">
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
