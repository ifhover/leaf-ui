import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerDateTime() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="预约时间">
        <DatePicker picker="datetime" defaultValue={new Date(2026, 9, 3, 14, 30)} />
      </FormField>
    </Form>
  );
}
