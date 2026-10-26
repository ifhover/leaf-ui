import { AutoComplete, Form, FormField } from '@ifhover/leaf-ui';

const options = [{ value: 'Leaf Garden' }, { value: 'Leaf Studio' }];

export function AutoCompleteStates() {
  return (
    <Form layout="vertical">
      <FormField label="Disabled">
        <AutoComplete aria-label="Disabled" options={options} defaultValue="Leaf Garden" disabled />
      </FormField>
      <FormField label="Read only">
        <AutoComplete
          aria-label="Read only"
          options={options}
          defaultValue="Leaf Garden"
          readOnly
        />
      </FormField>
    </Form>
  );
}
