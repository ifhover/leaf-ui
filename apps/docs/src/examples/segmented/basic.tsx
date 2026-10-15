import { Segmented, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function SegmentedBasic() {
  const [value, setValue] = useState('按周');
  return (
    <Space direction="vertical" align="stretch">
      <Segmented options={['按日', '按周', '按月']} value={value} onChange={setValue} />
      <output>
        <Text tone="muted">当前视图: {value}</Text>
      </output>
    </Space>
  );
}
