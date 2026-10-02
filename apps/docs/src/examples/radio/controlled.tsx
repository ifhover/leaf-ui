import { RadioGroup } from '@leaf-ui/react';
import { useState } from 'react';

export function RadioControlled() {
  const [value, setValue] = useState('daily');
  return (
    <div className="leaf-demo-stack">
      <RadioGroup
        label="提醒频率"
        direction="vertical"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        options={[
          { label: '每天', value: 'daily' },
          { label: '每周', value: 'weekly' },
          { label: '仅重要消息', value: 'important' },
        ]}
      />
      <span className="leaf-demo-note">当前选择：{value}</span>
    </div>
  );
}
