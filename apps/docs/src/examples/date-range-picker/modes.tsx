import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';
export function DateRangePickerModes() {
  return (
    <Form layout="vertical">
      <FormField label="年份区间">
        <DateRangePicker aria-label="年份区间" picker="year" placeholder="年份区间" />
      </FormField>
      <FormField label="月份区间">
        <DateRangePicker aria-label="月份区间" picker="month" placeholder="月份区间" />
      </FormField>
      <FormField label="季度区间">
        <DateRangePicker
          aria-label="季度区间"
          format="YYYY-[Q]Q"
          picker="quarter"
          placeholder="季度区间"
        />
      </FormField>
      <FormField label="周区间">
        <DateRangePicker aria-label="周区间" picker="week" placeholder="周区间" />
      </FormField>
      <FormField label="日期时间区间">
        <DateRangePicker
          aria-label="日期时间区间"
          picker="datetime"
          placeholder="日期时间区间"
          use12Hours
        />
      </FormField>
    </Form>
  );
}
