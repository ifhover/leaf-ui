import { Select, type SelectOption } from '@sudden3/leaf-ui';
import { useState } from 'react';

const options: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];
export function SelectSearch() {
  const [teams, setTeams] = useState<string[]>(['design']);
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Search teams</span>
        <Select
          aria-label="Search teams"
          showSearch
          allowClear
          options={options}
          placeholder="Type to search"
        />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Choose several teams</span>
        <Select
          aria-label="Choose several teams"
          multiple
          showSearch
          allowClear
          options={options}
          value={teams}
          onChange={setTeams}
        />
      </div>
      <output className="leaf-demo-note">{teams.join(', ') || '—'}</output>
    </div>
  );
}
