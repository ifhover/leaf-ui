import { Flex, Splitter, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SplitterLimits() {
  const [sizes, setSizes] = useState<readonly number[]>([35, 65]);

  return (
    <Flex direction="column" gap={16}>
      <Splitter
        style={{ height: 240 }}
        defaultSizes={[35, 65]}
        onResize={setSizes}
        panels={[
          { key: 'left', min: 20, max: 55, children: <Text>Left panel</Text> },
          { key: 'right', min: 30, children: <Text>Right panel</Text> },
        ]}
      />
      <Text tone="muted">Left proportion: {Math.round(sizes[0] ?? 0)}%</Text>
    </Flex>
  );
}
