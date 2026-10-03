import { Cascader } from '@leaf-ui/react';
import { useState } from 'react';
import { regions } from './options';

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <div className="leaf-demo-stack">
      <Cascader aria-label="收货地区" options={regions} value={value} onChange={setValue} />
      <span className="leaf-demo-note">选中路径：{value.join(' → ') || '未选择'}</span>
    </div>
  );
}
