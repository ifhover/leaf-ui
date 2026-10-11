import { DatePicker, Space } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Choose a date</span>
        <DatePicker aria-label="Choose a date" placeholder="Pick a good day" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Default date</span>
        <DatePicker aria-label="Default date" defaultValue={new Date(2026, 9, 15)} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled date</span>
        <DatePicker aria-label="Disabled date" defaultValue={new Date(2026, 9, 15)} disabled />
      </div>
    </Space>
  );
}
