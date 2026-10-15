import { Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <Space direction="vertical" align="stretch">
      <Rate aria-label="项目评分" value={value} onChange={setValue} allowHalf />
      <output>
        <Text tone="muted">当前评分: {value}</Text>
      </output>
    </Space>
  );
}
