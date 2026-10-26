import { Button, Countdown, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function StatisticCountdown() {
  const [deadline, setDeadline] = useState(() => Date.now() + 10000);
  const [finished, setFinished] = useState(false);
  return (
    <Flex direction="column" gap="md" align="start">
      <Countdown
        title="Time remaining"
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
        Restart
      </Button>
      <Text tone="muted" role="status">
        {finished ? 'Countdown finished' : 'Counting down'}
      </Text>
    </Flex>
  );
}
