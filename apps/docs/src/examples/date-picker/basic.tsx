import { DatePicker } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return <DatePicker aria-label="默认日期" defaultValue={new Date(2026, 9, 15)} />;
}
