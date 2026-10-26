import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function TimePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Choose a time">
        <DatePicker picker="time" aria-label="Choose a time" />
      </FormField>
      <FormField label="Default time">
        <DatePicker picker="time" aria-label="Default time" defaultValue="09:30" />
      </FormField>
      <FormField label="Disabled time">
        <DatePicker picker="time" aria-label="Disabled time" defaultValue="18:00" disabled />
      </FormField>
    </Form>
  );
}
