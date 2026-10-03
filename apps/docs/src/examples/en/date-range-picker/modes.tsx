import { DateRangePicker } from '@sudden3/leaf-ui';
export function DateRangePickerModes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <DateRangePicker aria-label="Year range" picker="year" placeholder="Select a year range" />
      <DateRangePicker aria-label="Month range" picker="month" placeholder="Select a month range" />
      <DateRangePicker aria-label="Week range" picker="week" placeholder="Select a week range" />
      <DateRangePicker
        aria-label="Weekday date range"
        picker="weekday"
        placeholder="Select a date within a week"
      />
      <DateRangePicker
        aria-label="Date and time range"
        picker="datetime"
        placeholder="Select a date and time range"
        use12Hours
      />
    </div>
  );
}
