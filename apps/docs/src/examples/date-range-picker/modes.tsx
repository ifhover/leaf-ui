import { DateRangePicker } from '@sudden3/leaf-ui';
export function DateRangePickerModes() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <DateRangePicker aria-label="年份区间" picker="year" placeholder="选择年份区间" />
      <DateRangePicker aria-label="月份区间" picker="month" placeholder="选择月份区间" />
      <DateRangePicker aria-label="周区间" picker="week" placeholder="选择周区间" />
      <DateRangePicker aria-label="星期日期区间" picker="weekday" placeholder="选择某周中的日期" />
      <DateRangePicker
        aria-label="日期时间区间"
        picker="datetime"
        placeholder="选择日期时间区间"
        use12Hours
      />
    </div>
  );
}
