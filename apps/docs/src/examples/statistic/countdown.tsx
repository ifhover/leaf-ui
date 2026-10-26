import { Button, Countdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function StatisticCountdown() {
  const [deadline, setDeadline] = useState(() => Date.now() + 10000);
  const [finished, setFinished] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Countdown
        title={'剩余时间'}
        value={deadline}
        format="mm:ss"
        initialRemaining={10000}
        onFinish={() => setFinished(true)}
      />
      <Button
        onClick={() => {
          setFinished(false);
          setDeadline(Date.now() + 10000);
        }}
      >
        {'重新开始'}
      </Button>
      <Text tone="muted" role="status">
        {finished ? '倒计时已结束' : '倒计时进行中'}
      </Text>
    </Flex>
  );
}
