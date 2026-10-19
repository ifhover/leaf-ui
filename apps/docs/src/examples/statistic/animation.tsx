import { Button, Space, Statistic } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function StatisticAnimation({ english = false }: { english?: boolean }) {
  const [value, setValue] = useState(1286.5);
  const [replay, setReplay] = useState(0);
  return (
    <Space direction="vertical" size={20}>
      <Statistic
        key={replay}
        title={english ? 'Revenue' : '收入'}
        value={value}
        initialValue={1000}
        precision={2}
        prefix="¥"
      />
      <Space wrap>
        <Button onClick={() => setValue((current) => current + 500)}>
          {english ? 'Increase' : '增加'}
        </Button>
        <Button variant="outline" onClick={() => setValue((current) => current - 500)}>
          {english ? 'Decrease' : '减少'}
        </Button>
        <Button variant="outline" onClick={() => setReplay((current) => current + 1)}>
          {english ? 'Replay from 1,000' : '从 1,000 重播'}
        </Button>
      </Space>
    </Space>
  );
}
