import { Calendar, Space, Text } from '@ifhover/leaf-ui';
export function CalendarCompact() {
  return (
    <Space direction="vertical" align="stretch">
      <Calendar
        fullscreen={false}
        defaultValue={new Date(2026, 9, 4)}
        disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
      <Text tone="muted">周末不可选；已有的选中日期仍清晰可见。</Text>
    </Space>
  );
}
