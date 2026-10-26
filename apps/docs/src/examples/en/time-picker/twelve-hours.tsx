import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';
export function TimePickerTwelveHours() {
  return (
    <Form layout="vertical">
      <FormField label="12-hour clock">
        <DatePicker picker="time" aria-label="12-hour clock" use12Hours defaultValue="14:30" />
      </FormField>
      <FormField label="Include seconds">
        <DatePicker
          picker="time"
          aria-label="Include seconds"
          use12Hours
          showSeconds
          secondStep={10}
          defaultValue="00:05:30"
        />
      </FormField>
    </Form>
  );
}
