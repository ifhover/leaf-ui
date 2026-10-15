import { Segmented, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SegmentedBasic() {
  const [value, setValue] = useState('Weekly');
  return (
    <Space direction="vertical" align="stretch">
      <Segmented options={['Daily', 'Weekly', 'Monthly']} value={value} onChange={setValue} />
      <output>
        <Text tone="muted">Current view: {value}</Text>
      </output>
    </Space>
  );
}
