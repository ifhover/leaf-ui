import { Button, Flex, Progress, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ProgressControlled() {
  const [percent, setPercent] = useState(45);

  return (
    <Space direction="vertical" align="stretch">
      <Progress percent={percent} aria-label="上传进度" />
      <Flex gap="md" align="center" wrap>
        <Button
          variant="outline"
          disabled={percent === 0}
          onClick={() => setPercent((current) => Math.max(0, current - 10))}
        >
          减少
        </Button>
        <Button
          disabled={percent === 100}
          onClick={() => setPercent((current) => Math.min(100, current + 10))}
        >
          增加
        </Button>
      </Flex>
    </Space>
  );
}
