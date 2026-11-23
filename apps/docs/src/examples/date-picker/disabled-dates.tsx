import { DatePicker } from '@ifhover/leaf-ui';

export function DisabledDates() {
  return (
    <DatePicker
      aria-label="十月工作日"
      defaultValue={new Date(2026, 9, 15)}
      minDate={new Date(2026, 9, 1)}
      maxDate={new Date(2026, 9, 31)}
      disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
    />
  );
}
