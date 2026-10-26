import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerTime() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Default time">
        <DatePicker picker="time" defaultValue="09:30" />
      </FormField>
    </Form>
  );
}
