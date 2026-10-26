import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerModes() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="年份区间">
        <DateRangePicker picker="year" />
      </FormField>
      <FormField label="季度区间">
        <DateRangePicker picker="quarter" />
      </FormField>
      <FormField label="月份区间">
        <DateRangePicker picker="month" />
      </FormField>
      <FormField label="周区间">
        <DateRangePicker picker="week" />
      </FormField>
    </Form>
  );
}
