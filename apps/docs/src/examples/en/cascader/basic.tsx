import { Cascader, type CascaderOption, Form, FormField } from '@ifhover/leaf-ui';

const options: CascaderOption[] = [
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
        <Cascader options={options} placeholder="Choose a category" />
      </FormField>
    </Form>
  );
}
