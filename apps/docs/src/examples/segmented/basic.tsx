import { Segmented, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SegmentedBasic() {
  const [value, setValue] = useState('按周');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Segmented options={['按日', '按周', '按月']} value={value} onChange={setValue} />
      <output className="leaf-demo-note">当前视图: {value}</output>
    </Space>
  );
}
