import { DateRangePicker } from '@ifhover/leaf-ui';

export function DateRangePickerDateTime() {
  return (
    <DateRangePicker
      aria-label="预约时段"
      picker="datetime"
      defaultTime={['09:00', '18:00']}
      minuteStep={15}
    />
  );
}
