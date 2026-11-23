import { DatePicker } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return <DatePicker aria-label="Default date" defaultValue={new Date(2026, 9, 15)} />;
}
