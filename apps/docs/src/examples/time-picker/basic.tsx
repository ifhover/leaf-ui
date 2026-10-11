import { Space, TimePicker } from '@ifhover/leaf-ui';

export function TimePickerBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">选择时间</span>
        <TimePicker aria-label="选择时间" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">默认时间</span>
        <TimePicker aria-label="默认时间" defaultValue="09:30" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用时间</span>
        <TimePicker aria-label="禁用时间" defaultValue="18:00" disabled />
      </div>
    </Space>
  );
}
