import { Button, Flex, Statistic } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function StatisticAnimation() {
  const [value, setValue] = useState(1286.5);
  const [replay, setReplay] = useState(0);
  return (
    <Flex direction="column" gap="md" align="start">
      <Statistic
        key={replay}
        title="Revenue"
        value={value}
        initialValue={1000}
        precision={2}
        prefix="¥"
      />
      <Flex gap="sm" align="center" wrap>
        <Button onClick={() => setValue((current) => current + 500)}>Increase</Button>
        <Button onClick={() => setValue((current) => current - 500)}>Decrease</Button>
        <Button onClick={() => setReplay((current) => current + 1)}>Replay from 1,000</Button>
      </Flex>
    </Flex>
  );
}
