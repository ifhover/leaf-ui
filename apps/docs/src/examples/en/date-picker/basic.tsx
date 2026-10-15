import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="Choose a date">
        <DatePicker aria-label="Choose a date" placeholder="Pick a good day" />
      </FormField>
      <FormField label="Default date">
        <DatePicker aria-label="Default date" defaultValue={new Date(2026, 9, 15)} />
      </FormField>
      <FormField label="Disabled date">
        <DatePicker aria-label="Disabled date" defaultValue={new Date(2026, 9, 15)} disabled />
      </FormField>
    </Form>
  );
}
