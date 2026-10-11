import { Segmented, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SegmentedBasic() {
  const [value, setValue] = useState('Weekly');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Segmented options={['Daily', 'Weekly', 'Monthly']} value={value} onChange={setValue} />
      <output className="leaf-demo-note">Current view: {value}</output>
    </Space>
  );
}
