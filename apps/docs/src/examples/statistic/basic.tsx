import { Countdown, Space, Statistic } from '@sudden3/leaf-ui';
import { ArrowUp } from 'lucide-react';
import { useState } from 'react';
export function StatisticBasic({ english = false }: { english?: boolean }) {
  return (
    <Space size={32} wrap>
      <Statistic title={english ? 'Revenue' : '总收入'} value={12856.8} precision={2} prefix="¥" />
      <Statistic
        title={english ? 'Growth' : '增长率'}
        value={12.5}
        precision={1}
        prefix={<ArrowUp size={20} />}
        suffix="%"
      />
    </Space>
  );
}
export function StatisticCountdown({ english = false }: { english?: boolean }) {
  const [deadline] = useState(() => Date.now() + 3600000);
  return <Countdown title={english ? 'Time until the event' : '距离活动开始'} value={deadline} />;
}
