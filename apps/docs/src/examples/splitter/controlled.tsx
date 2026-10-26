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
          { key: 'left', children: <Text>左侧面板</Text> },
          { key: 'right', children: <Text>右侧面板</Text> },
        ]}
      />
      <Text tone="muted">当前比例：{sizes.map((size) => `${Math.round(size)}%`).join(' / ')}</Text>
      <Flex>
        <Button onClick={() => setSizes([35, 65])}>重置比例</Button>
      </Flex>
    </Flex>
  );
}
