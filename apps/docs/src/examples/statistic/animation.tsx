import { Button, Flex, Statistic } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function StatisticAnimation() {
  const [value, setValue] = useState(1286.5);
  const [replay, setReplay] = useState(0);
  return (
    <Flex direction="column" gap="md" align="start">
      <Statistic
        key={replay}
        title={'收入'}
        value={value}
        initialValue={1000}
        precision={2}
        prefix="¥"
      />
      <Flex gap="sm" align="center" wrap>
        <Button onClick={() => setValue((current) => current + 500)}>{'增加'}</Button>
        <Button onClick={() => setValue((current) => current - 500)}>{'减少'}</Button>
        <Button onClick={() => setReplay((current) => current + 1)}>{'从 1,000 重播'}</Button>
      </Flex>
    </Flex>
  );
}
