import { Rate, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateBasic() {
  const [value, setValue] = useState(3.5);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Rate aria-label="Project rating" value={value} onChange={setValue} allowHalf />
      <output className="leaf-demo-note">Current rating: {value}</output>
    </Space>
  );
}
