import { Space, Text, TimeRangePicker } from '@ifhover/leaf-ui';

export function TimeRangePickerOptions() {
  return (
    <Space direction="vertical" align="stretch">
      <Text tone="muted">12 小时制与秒</Text>
      <TimeRangePicker use12Hours showSeconds defaultValue={['09:30:00', '17:45:00']} />
      <Text tone="muted">允许跨过午夜</Text>
      <TimeRangePicker allowOvernight defaultValue={['22:00', '06:00']} />
    </Space>
  );
}
