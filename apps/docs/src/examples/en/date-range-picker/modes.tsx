import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerModes() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Year range">
        <DateRangePicker picker="year" />
      </FormField>
      <FormField label="Quarter range">
        <DateRangePicker picker="quarter" />
      </FormField>
      <FormField label="Month range">
        <DateRangePicker picker="month" />
      </FormField>
      <FormField label="Week range">
        <DateRangePicker picker="week" />
      </FormField>
    </Form>
  );
}
