import { Button, ConfigProvider, Space, Statistic } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function StatisticFixture() {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState(1000);
  const [motion, setMotion] = useState(true);
  return (
    <ConfigProvider theme={{ motion }}>
      <Space direction="vertical">
        <Statistic
          data-testid="metric"
          title="Revenue"
          prefix="$"
          value={value}
          initialValue={500}
          precision={2}
          loading={loading}
          aria-live="polite"
        />
        <Space wrap>
          <Button onClick={() => setLoading(false)}>Start</Button>
          <Button onClick={() => setValue(-1000)}>Decrease</Button>
          <Button onClick={() => setValue(2000)}>Increase</Button>
          <Button onClick={() => setMotion(false)}>Disable motion</Button>
        </Space>
      </Space>
    </ConfigProvider>
  );
}
