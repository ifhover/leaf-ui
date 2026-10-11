import { Cascader, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
import { regions } from './options';

export function CascaderControlled() {
  const [value, setValue] = useState<string[]>(['zhejiang', 'hangzhou', 'xihu']);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">收货地区</span>
        <Cascader aria-label="收货地区" options={regions} value={value} onChange={setValue} />
      </div>
      <span className="leaf-demo-note">选中路径：{value.join(' → ') || '未选择'}</span>
    </Space>
  );
}
