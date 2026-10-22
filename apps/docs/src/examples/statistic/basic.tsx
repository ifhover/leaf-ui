import { Space, Statistic } from '@ifhover/leaf-ui';
import { ArrowUp } from 'lucide-react';
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
