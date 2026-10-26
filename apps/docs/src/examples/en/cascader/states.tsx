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

const value = ['design', 'interface'];

export function CascaderStates() {
  return (
    <Form layout="vertical">
      <FormField label="Disabled">
        <Cascader options={options} value={value} disabled />
      </FormField>
      <FormField label="Read-only">
        <Cascader options={options} value={value} readOnly />
      </FormField>
    </Form>
  );
}
