import { AutoComplete, Flex, Form, FormField, Text } from '@ifhover/leaf-ui';
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
          options={options}
          placeholder="Type Leaf or enter any text"
          value={value}
          onChange={setValue}
          onSelect={setSelected}
        />
      </FormField>
      <Flex direction="column" gap={8} role="status">
        <Text tone="muted">Input: {value || 'Empty'}</Text>
        <Text tone="muted">Last selection: {selected || 'None'}</Text>
      </Flex>
    </Form>
  );
}
