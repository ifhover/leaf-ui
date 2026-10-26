import { Button, Flex, LoadingBar, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingBarProgress() {
  const [progress, setProgress] = useState<number>();

  return (
    <Flex direction="column" gap="md" align="start">
      <LoadingBar active={progress !== undefined} progress={progress} />
      <Space wrap>
        <Button variant="outline" onClick={() => setProgress(40)}>
          设为 40%
        </Button>
        <Button variant="outline" onClick={() => setProgress(70)}>
          设为 70%
        </Button>
        <Button disabled={progress === undefined} onClick={() => setProgress(undefined)}>
          完成
        </Button>
      </Space>
      <Text role="status">
        {progress === undefined ? '加载条已收起' : `当前进度：${progress}%`}
      </Text>
    </Flex>
  );
}
