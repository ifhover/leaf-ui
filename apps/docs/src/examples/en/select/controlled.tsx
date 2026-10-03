import { Select } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SelectControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="leaf-demo-stack">
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
      <span className="leaf-demo-note">Current:{value || 'Not selected'}</span>
      <Select
        aria-label="Team required"
        status="error"
        placeholder="Select a team"
        options={[{ label: 'Design team', value: 'design' }]}
      />
    </div>
  );
}
