import { Form, FormField, Select } from '@ifhover/leaf-ui';

const options = [
  { label: 'Design studio', value: 'design' },
  { label: 'Product team', value: 'product' },
  { label: 'Engineering team', value: 'engineering' },
  { label: 'Archived project', value: 'archived', disabled: true },
];

export function SelectBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Choose a team">
        <Select aria-label="Choose a team" options={options} placeholder="Select a team" />
      </FormField>
      <FormField label="Default team">
        <Select aria-label="Default team" options={options} defaultValue="design" />
      </FormField>
      <FormField label="Disabled team">
        <Select aria-label="Disabled team" options={options} disabled defaultValue="product" />
      </FormField>
    </Form>
  );
}
