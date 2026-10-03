import { DatePicker } from '@leaf-ui/react';

export function DatePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <DatePicker aria-label="选择日期" placeholder="选择一个好日子" />
      <DatePicker aria-label="默认日期" defaultValue={new Date(2026, 9, 15)} />
      <DatePicker aria-label="禁用日期" defaultValue={new Date(2026, 9, 15)} disabled />
    </div>
  );
}
