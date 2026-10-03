import { RadioGroup } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function RadioControlled() {
  const [value, setValue] = useState('daily');
  return (
    <div className="leaf-demo-stack">
      <RadioGroup
        label="Notification frequency"
        direction="vertical"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        options={[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Important messages only', value: 'important' },
        ]}
      />
      <span className="leaf-demo-note">Selected:{value}</span>
    </div>
  );
}
