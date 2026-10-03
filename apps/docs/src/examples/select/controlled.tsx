import { Select } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function SelectControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="leaf-demo-stack">
      <Select
        aria-label="项目可见性"
        value={value}
        placeholder="选择可见性"
        allowClear
        onChange={setValue}
        options={[
          { label: '公开', value: 'public' },
          { label: '团队', value: 'team' },
          { label: '私密', value: 'private' },
        ]}
      />
      <span className="leaf-demo-note">当前值：{value || '尚未选择'}</span>
      <Select
        aria-label="未设置团队"
        status="error"
        placeholder="请选择所属团队"
        options={[{ label: '设计团队', value: 'design' }]}
      />
    </div>
  );
}
