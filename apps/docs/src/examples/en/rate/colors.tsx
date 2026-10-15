import { Flex, Rate, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function RateColors() {
  const [value, setValue] = useState(2);
  return (
    <Space direction="vertical" align="stretch">
      <Rate aria-label="Score colors" value={value} onChange={setValue} colorByValue />
      <output>
        <Text tone="muted">
          Coral for low scores, amber for medium and yellow for high. Current rating: {value}
        </Text>
      </output>
      <Flex direction="column" gap="sm">
        <Text>Brand color</Text>
        <Rate defaultValue={4} readOnly color="#7654c6" />
      </Flex>
    </Space>
  );
}
