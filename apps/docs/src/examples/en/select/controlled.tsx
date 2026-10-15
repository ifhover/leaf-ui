import { Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SelectControlled() {
  const [value, setValue] = useState('');
  return (
    <Form layout="vertical">
      <FormField label="Project visibility">
        <Select
          aria-label="Project visibility"
          value={value}
          placeholder="Select visibility"
          allowClear
          onChange={setValue}
          options={[
            { label: 'Public', value: 'public' },
            { label: 'Team', value: 'team' },
            { label: 'Private', value: 'private' },
          ]}
        />
      </FormField>
      <Text tone="muted">Current:{value || 'Not selected'}</Text>
      <FormField label="Team required · Error">
        <Select
          aria-label="Team required"
          status="error"
          placeholder="Select a team"
          options={[{ label: 'Design team', value: 'design' }]}
        />
      </FormField>
    </Form>
  );
}
