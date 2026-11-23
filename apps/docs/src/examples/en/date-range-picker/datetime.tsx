import { DateRangePicker } from '@ifhover/leaf-ui';

export function DateRangePickerDateTime() {
  return (
    <DateRangePicker
      aria-label="Booking window"
      picker="datetime"
      defaultTime={['09:00', '18:00']}
      minuteStep={15}
    />
  );
}
