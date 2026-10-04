import { Select } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SelectControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project visibility</span>
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
      </div>
      <span className="leaf-demo-note">Current:{value || 'Not selected'}</span>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Team required · Error</span>
        <Select
          aria-label="Team required"
          status="error"
          placeholder="Select a team"
          options={[{ label: 'Design team', value: 'design' }]}
        />
      </div>
    </div>
  );
}
