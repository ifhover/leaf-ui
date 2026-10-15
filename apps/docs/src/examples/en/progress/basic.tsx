import { Button, Flex, Progress, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ProgressBasic() {
  const [percent, setPercent] = useState(45);
  return (
    <Space direction="vertical" align="stretch">
      <Progress percent={percent} aria-label="Upload progress" />
      <Flex gap="md" align="center" wrap justify="center">
        <Button
          variant="outline"
          disabled={percent === 0}
          onClick={() => setPercent(Math.max(0, percent - 10))}
        >
          Decrease
        </Button>
        <Button disabled={percent === 100} onClick={() => setPercent(Math.min(100, percent + 10))}>
          Increase
        </Button>
      </Flex>
    </Space>
  );
}
