import { DatePicker } from '@ifhover/leaf-ui';

export function DatePickerDateTime() {
  return (
    <DatePicker
      aria-label="Appointment"
      picker="datetime"
      defaultValue={new Date(2026, 9, 3, 14, 30)}
    />
  );
}
