import { DateRangePicker } from '@sudden3/leaf-ui';
export function DateRangePickerModes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Year range</span>
        <DateRangePicker aria-label="Year range" picker="year" placeholder="Year range" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Month range</span>
        <DateRangePicker aria-label="Month range" picker="month" placeholder="Month range" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Week range</span>
        <DateRangePicker aria-label="Week range" picker="week" placeholder="Week range" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Date and time range</span>
        <DateRangePicker
          aria-label="Date and time range"
          picker="datetime"
          placeholder="Date and time range"
          use12Hours
        />
      </div>
    </div>
  );
}
