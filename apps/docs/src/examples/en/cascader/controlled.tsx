import { Cascader } from '@sudden3/leaf-ui';
import { useState } from 'react';
import { regions } from './options';

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <div className="leaf-demo-stack">
      <Cascader aria-label="Delivery region" options={regions} value={value} onChange={setValue} />
      <span className="leaf-demo-note">Selected path:{value.join(' → ') || 'Not selected'}</span>
    </div>
  );
}
