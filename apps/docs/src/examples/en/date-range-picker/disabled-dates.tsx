import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DisabledDates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="October delivery window">
        <DateRangePicker
          defaultValue={[new Date(2026, 9, 5), new Date(2026, 9, 9)]}
          minDate={new Date(2026, 9, 1)}
          maxDate={new Date(2026, 9, 31)}
          disabledDate={(date) => date.getDay() === 0}
        />
      </FormField>
    </Form>
  );
}
