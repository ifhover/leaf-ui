import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';
export function DateRangePickerModes() {
  return (
    <Form layout="vertical">
      <FormField label="Year range">
        <DateRangePicker aria-label="Year range" picker="year" placeholder="Year range" />
      </FormField>
      <FormField label="Month range">
        <DateRangePicker aria-label="Month range" picker="month" placeholder="Month range" />
      </FormField>
      <FormField label="Week range">
        <DateRangePicker aria-label="Week range" picker="week" placeholder="Week range" />
      </FormField>
      <FormField label="Date and time range">
        <DateRangePicker
          aria-label="Date and time range"
          picker="datetime"
          placeholder="Date and time range"
          use12Hours
        />
      </FormField>
    </Form>
  );
}
