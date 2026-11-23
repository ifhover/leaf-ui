import { DateRangePicker } from '@ifhover/leaf-ui';

export function DateRangePickerOvernight() {
  return (
    <DateRangePicker
      aria-label="夜间值班"
      picker="time"
      allowOvernight
      defaultValue={['22:00', '06:00']}
    />
  );
}
