import { DateRangePicker } from '@sudden3/leaf-ui';
export function DateRangePickerModes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <DateRangePicker aria-label="Year range" picker="year" placeholder="Year range" />
      <DateRangePicker aria-label="Month range" picker="month" placeholder="Month range" />
      <DateRangePicker aria-label="Week range" picker="week" placeholder="Week range" />
      <DateRangePicker
        aria-label="Date and time range"
        picker="datetime"
        placeholder="Date and time range"
        use12Hours
      />
    </div>
  );
}
