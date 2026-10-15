import { Calendar, Space, Text } from '@ifhover/leaf-ui';
export function CalendarCompact() {
  return (
    <Space direction="vertical" align="stretch">
      <Calendar
        fullscreen={false}
        defaultValue={new Date(2026, 9, 4)}
        disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
      <Text tone="muted">Weekends are unavailable; an existing selection remains readable.</Text>
    </Space>
  );
}
