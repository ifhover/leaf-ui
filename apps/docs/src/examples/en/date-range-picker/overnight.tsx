import { DateRangePicker } from '@ifhover/leaf-ui';

export function DateRangePickerOvernight() {
  return (
    <DateRangePicker
      aria-label="Overnight shift"
      picker="time"
      allowOvernight
      defaultValue={['22:00', '06:00']}
    />
  );
}
