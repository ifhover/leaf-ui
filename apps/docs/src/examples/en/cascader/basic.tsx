import { Cascader, Form, FormField } from '@ifhover/leaf-ui';

const options = [
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'interface', label: 'Interface design' },
      { value: 'brand', label: 'Brand design' },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend development' },
      { value: 'backend', label: 'Backend development' },
    ],
  },
  { value: 'archived', label: 'Archived category', disabled: true },
];

export function CascaderBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Project category">
        <Cascader aria-label="Project category" options={options} placeholder="Choose a category" />
      </FormField>
      <FormField label="Default category">
        <Cascader
          aria-label="Default category"
          options={options}
          defaultValue={['design', 'interface']}
        />
      </FormField>
      <FormField label="Disabled category">
        <Cascader aria-label="Disabled category" options={options} disabled />
      </FormField>
    </Form>
  );
}
