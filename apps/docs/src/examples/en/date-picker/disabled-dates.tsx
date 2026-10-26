import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DisabledDates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Weekday in October">
        <DatePicker
          defaultValue={new Date(2026, 9, 15)}
          minDate={new Date(2026, 9, 1)}
          maxDate={new Date(2026, 9, 31)}
          disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
        />
      </FormField>
    </Form>
  );
}
