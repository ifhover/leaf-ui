import { Calendar, Space } from '@ifhover/leaf-ui';
export function CalendarCompact() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <Calendar
        fullscreen={false}
        defaultValue={new Date(2026, 9, 4)}
        disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
      <p className="leaf-demo-note">周末不可选；已有的选中日期仍清晰可见。</p>
    </Space>
  );
}
