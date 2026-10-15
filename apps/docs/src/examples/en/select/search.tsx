import type { SelectOption } from '@ifhover/leaf-ui';
import { Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];
export function SelectSearch() {
  const [teams, setTeams] = useState<string[]>(['design']);
  return (
    <Form layout="vertical">
      <FormField label="Search teams">
        <Select
          aria-label="Search teams"
          showSearch
          allowClear
          options={options}
          placeholder="Type to search"
        />
      </FormField>
      <FormField label="Choose several teams">
        <Select
          aria-label="Choose several teams"
          multiple
          showSearch
          allowClear
          options={options}
          value={teams}
          onChange={setTeams}
        />
      </FormField>
      <output>
        <Text tone="muted">{teams.join(', ') || '—'}</Text>
      </output>
    </Form>
  );
}
