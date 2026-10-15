import { Form, FormField, TimePicker } from '@ifhover/leaf-ui';

export function TimePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Choose a time">
        <TimePicker aria-label="Choose a time" />
      </FormField>
      <FormField label="Default time">
        <TimePicker aria-label="Default time" defaultValue="09:30" />
      </FormField>
      <FormField label="Disabled time">
        <TimePicker aria-label="Disabled time" defaultValue="18:00" disabled />
      </FormField>
    </Form>
  );
}
