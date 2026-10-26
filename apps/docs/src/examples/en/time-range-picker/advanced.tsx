import { DateRangePicker, Space, Text } from '@ifhover/leaf-ui';

export function TimeRangePickerOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">12-hour clock with seconds</Text>
      <DateRangePicker
        picker="time"
        use12Hours
        showSeconds
        defaultValue={['09:30:00', '17:45:00']}
      />
      <Text tone="muted">Allow an overnight range</Text>
      <DateRangePicker picker="time" allowOvernight defaultValue={['22:00', '06:00']} />
    </Space>
  );
}
