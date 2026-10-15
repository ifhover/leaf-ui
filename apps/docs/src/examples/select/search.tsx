import type { SelectOption } from '@ifhover/leaf-ui';
import { Form, FormField, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options: SelectOption[] = [
  { value: 'design', label: '设计' },
  { value: 'engineering', label: '研发' },
  { value: 'marketing', label: '市场' },
];
export function SelectSearch() {
  const [teams, setTeams] = useState<string[]>(['design']);
  return (
    <Form layout="vertical">
      <FormField label="搜索团队">
        <Select
          aria-label="搜索团队"
          showSearch
          allowClear
          options={options}
          placeholder="输入搜索团队"
        />
      </FormField>
      <FormField label="多选团队">
        <Select
          aria-label="多选团队"
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
