import { DateRangePicker, Space, Text } from '@ifhover/leaf-ui';

export function TimeRangePickerOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">12 小时制与秒</Text>
      <DateRangePicker
        picker="time"
        use12Hours
        showSeconds
        defaultValue={['09:30:00', '17:45:00']}
      />
      <Text tone="muted">允许跨过午夜</Text>
      <DateRangePicker picker="time" allowOvernight defaultValue={['22:00', '06:00']} />
    </Space>
  );
}
