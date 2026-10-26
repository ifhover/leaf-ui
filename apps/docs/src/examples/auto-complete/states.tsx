import { AutoComplete, Form, FormField } from '@ifhover/leaf-ui';

const options = [{ value: 'Leaf Garden' }, { value: 'Leaf Studio' }];

export function AutoCompleteStates() {
  return (
    <Form layout="vertical">
      <FormField label="禁用">
        <AutoComplete aria-label="禁用" options={options} defaultValue="Leaf Garden" disabled />
      </FormField>
      <FormField label="只读">
        <AutoComplete aria-label="只读" options={options} defaultValue="Leaf Garden" readOnly />
      </FormField>
    </Form>
  );
}
