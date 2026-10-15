import { Form, FormField, Select } from '@ifhover/leaf-ui';

const options = [
  { value: '0', label: 'A longer design team name' },
  { value: '1', label: 'Frontend' },
  { value: '2', label: 'Backend' },
  { value: '3', label: 'Operations' },
];
const selected = options.map((option) => option.value);

export function SingleLine() {
  return (
    <Form layout="vertical">
      <FormField label="Single line with long labels">
        <Select
          multiple
          showSearch
          allowClear
          tagWrap={false}
          options={options}
          defaultValue={selected}
        />
      </FormField>
      <FormField label="Wrapping by default">
        <Select multiple options={options} defaultValue={selected} />
      </FormField>
    </Form>
  );
}
