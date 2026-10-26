import { Button, Flex, LoadingBar, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function LoadingBarProgress() {
  const [progress, setProgress] = useState<number>();

  return (
    <Flex direction="column" gap="md" align="start">
      <LoadingBar active={progress !== undefined} progress={progress} />
      <Space wrap>
        <Button variant="outline" onClick={() => setProgress(40)}>
          Set to 40%
        </Button>
        <Button variant="outline" onClick={() => setProgress(70)}>
          Set to 70%
        </Button>
        <Button disabled={progress === undefined} onClick={() => setProgress(undefined)}>
          Finish
        </Button>
      </Space>
      <Text role="status">
        {progress === undefined ? 'Loading bar is hidden' : `Current progress: ${progress}%`}
      </Text>
    </Flex>
  );
}
