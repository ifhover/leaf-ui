import { DateRangePicker, Space } from '@sudden3/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <div>
        <p style={{ margin: '0 0 8px' }}>{english ? 'Quarter range' : '季度区间'}</p>
        <DateRangePicker picker="quarter" format="YYYY-[Q]Q" />
      </div>
      <div>
        {english
          ? 'Allow an open end, or use a recent-seven-day preset'
          : '允许结束为空，或选择最近七天'}
        <DateRangePicker
          allowEmpty={[false, true]}
          disabledDate={(date) => date.getDay() === 0}
          presets={[
            {
              label: english ? 'Recent 7 days' : '最近七天',
              value: () => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 6);
                return [start, end];
              },
            },
          ]}
        />
      </div>
    </Space>
  );
}
