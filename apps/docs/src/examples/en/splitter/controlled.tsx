import { Button, Flex, Splitter, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function SplitterControlled() {
  const [sizes, setSizes] = useState<readonly number[]>([35, 65]);

  return (
    <Flex direction="column" gap={16}>
      <Splitter
        style={{ height: 240 }}
        sizes={sizes}
        onResize={setSizes}
        panels={[
          { key: 'left', children: <Text>Left panel</Text> },
          { key: 'right', children: <Text>Right panel</Text> },
        ]}
      />
      <Text tone="muted">
        Current proportions: {sizes.map((size) => `${Math.round(size)}%`).join(' / ')}
      </Text>
      <Flex>
        <Button onClick={() => setSizes([35, 65])}>Reset proportions</Button>
      </Flex>
    </Flex>
  );
}
