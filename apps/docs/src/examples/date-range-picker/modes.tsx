import { DateRangePicker } from '@sudden3/leaf-ui';
export function DateRangePickerModes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">年份区间</span>
        <DateRangePicker aria-label="年份区间" picker="year" placeholder="年份区间" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">月份区间</span>
        <DateRangePicker aria-label="月份区间" picker="month" placeholder="月份区间" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">周区间</span>
        <DateRangePicker aria-label="周区间" picker="week" placeholder="周区间" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">日期时间区间</span>
        <DateRangePicker
          aria-label="日期时间区间"
          picker="datetime"
          placeholder="日期时间区间"
          use12Hours
        />
      </div>
    </div>
  );
}
