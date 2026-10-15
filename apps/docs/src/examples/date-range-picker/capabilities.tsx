import { DateRangePicker, Flex, Space, Text } from '@ifhover/leaf-ui';
export function Capabilities({ english = false }) {
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>{english ? 'Quarter range' : '季度区间'}</Text>
        <DateRangePicker picker="quarter" format="YYYY-[Q]Q" />
      </Flex>
      <Flex direction="column" gap="sm" align="center">
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
      </Flex>
    </Space>
  );
}
