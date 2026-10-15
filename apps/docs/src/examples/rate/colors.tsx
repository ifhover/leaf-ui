import { Flex, Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateColors() {
  const [value, setValue] = useState(2);
  return (
    <Space direction="vertical" align="stretch">
      <Rate aria-label="按分数变色" value={value} onChange={setValue} colorByValue />
      <output>
        <Text tone="muted">低分珊瑚红，中等琥珀橙，高分星光黄。当前评分: {value}</Text>
      </output>
      <Flex direction="column" gap="sm">
        <Text>自定义品牌颜色</Text>
        <Rate defaultValue={4} readOnly color="#7654c6" />
      </Flex>
    </Space>
  );
}
