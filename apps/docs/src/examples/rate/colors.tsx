import { Rate, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateColors() {
  const [value, setValue] = useState(2);
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Rate aria-label="按分数变色" value={value} onChange={setValue} colorByValue />
      <output className="leaf-demo-note">
        低分珊瑚红，中等琥珀橙，高分星光黄。当前评分: {value}
      </output>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">自定义品牌颜色</span>
        <Rate defaultValue={4} readOnly color="#7654c6" />
      </div>
    </Space>
  );
}
