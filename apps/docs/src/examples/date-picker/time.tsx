import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerTime() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="默认时间">
        <DatePicker picker="time" defaultValue="09:30" />
      </FormField>
    </Form>
  );
}
