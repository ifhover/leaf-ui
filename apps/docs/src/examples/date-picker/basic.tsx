import { DatePicker } from '@sudden3/leaf-ui';

export function DatePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">选择日期</span>
        <DatePicker aria-label="选择日期" placeholder="选择一个好日子" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">默认日期</span>
        <DatePicker aria-label="默认日期" defaultValue={new Date(2026, 9, 15)} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用日期</span>
        <DatePicker aria-label="禁用日期" defaultValue={new Date(2026, 9, 15)} disabled />
      </div>
    </div>
  );
}
