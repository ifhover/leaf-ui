import { TimePicker } from '@leaf-ui/react';

export function TimePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <TimePicker aria-label="选择时间" />
      <TimePicker aria-label="默认时间" defaultValue="09:30" />
      <TimePicker aria-label="禁用时间" defaultValue="18:00" disabled />
    </div>
  );
}
