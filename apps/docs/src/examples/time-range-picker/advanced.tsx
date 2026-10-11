import { Space, TimeRangePicker } from '@ifhover/leaf-ui';

export function TimeRangePickerOptions() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <strong className="leaf-demo-note">12 小时制与秒</strong>
      <TimeRangePicker use12Hours showSeconds defaultValue={['09:30:00', '17:45:00']} />
      <strong className="leaf-demo-note">允许跨过午夜</strong>
      <TimeRangePicker allowOvernight defaultValue={['22:00', '06:00']} />
    </Space>
  );
}
