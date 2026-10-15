import { AutoComplete, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'Leaf Garden' },
  { value: 'Leaf Studio' },
  { value: 'Pine Forest' },
  { value: 'Archived Garden', disabled: true },
];

export function AutoCompleteBasic() {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="Project name">
        <AutoComplete
          aria-label="Project name"
          placeholder="Type Leaf or enter any text"
          options={options}
          value={value}
          onChange={setValue}
          onSelect={setSelected}
        />
      </FormField>
      <Text tone="muted">
        Input:{value || 'Empty'} · Last selection:{selected || 'None'}
      </Text>
      <FormField label="Disabled suggestions">
        <AutoComplete
          aria-label="Disabled suggestions"
          options={options}
          disabled
          defaultValue="Leaf Garden"
        />
      </FormField>
    </Form>
  );
}
