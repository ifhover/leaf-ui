import { Countdown } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function StatisticCountdown({ english = false }: { english?: boolean }) {
  const [deadline] = useState(() => Date.now() + 3600000);
  return <Countdown title={english ? 'Time until the event' : '距离活动开始'} value={deadline} />;
}
