import { DateRangePicker } from '@ifhover/leaf-ui';

export function DisabledDates() {
  return (
    <DateRangePicker
      aria-label="October delivery window"
      defaultValue={[new Date(2026, 9, 5), new Date(2026, 9, 9)]}
      minDate={new Date(2026, 9, 1)}
      maxDate={new Date(2026, 9, 31)}
      disabledDate={(date) => date.getDay() === 0}
    />
  );
}
