import { Select, type SelectOption } from '@sudden3/leaf-ui';
import { useState } from 'react';

const options: SelectOption[] = [
  { value: 'design', label: '设计' },
  { value: 'engineering', label: '研发' },
  { value: 'marketing', label: '市场' },
];
export function SelectSearch() {
  const [teams, setTeams] = useState<string[]>(['design']);
  return (
    <div className="leaf-demo-stack">
      <Select
        aria-label="搜索团队"
        showSearch
        allowClear
        options={options}
        placeholder="输入搜索团队"
      />
      <Select
        aria-label="多选团队"
        multiple
        showSearch
        allowClear
        options={options}
        value={teams}
        onChange={setTeams}
      />
      <output className="leaf-demo-note">{teams.join(', ') || '—'}</output>
    </div>
  );
}
