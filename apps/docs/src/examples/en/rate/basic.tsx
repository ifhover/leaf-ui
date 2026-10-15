import { Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <Space direction="vertical" align="stretch">
      <Rate aria-label="Project rating" value={value} onChange={setValue} allowHalf />
      <output>
        <Text tone="muted">Current rating: {value}</Text>
      </output>
    </Space>
  );
}
