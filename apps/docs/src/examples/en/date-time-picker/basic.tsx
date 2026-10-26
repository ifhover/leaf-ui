import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';
export function DateTimePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Appointment">
        <DatePicker
          picker="datetime"
          aria-label="Appointment"
          defaultValue={new Date(2026, 9, 3, 14, 30)}
        />
      </FormField>
      <FormField label="12-hour appointment">
        <DatePicker
          picker="datetime"
          aria-label="12-hour appointment"
          use12Hours
          minuteStep={15}
          secondStep={10}
        />
      </FormField>
      <FormField label="Bounded time">
        <DatePicker
          picker="datetime"
          aria-label="Bounded time"
          minDate={new Date(2026, 9, 1)}
          maxDate={new Date(2026, 9, 31, 23, 59, 59)}
          placeholder="Select a time in October"
        />
      </FormField>
    </Form>
  );
}
