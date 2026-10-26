import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerStates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Disabled">
        <DatePicker defaultValue={new Date(2026, 9, 15)} disabled />
      </FormField>
      <FormField label="Read-only">
        <DatePicker defaultValue={new Date(2026, 9, 15)} readOnly />
      </FormField>
      <FormField label="Panel selection only">
        <DatePicker defaultValue={new Date(2026, 9, 15)} inputReadOnly />
      </FormField>
    </Form>
  );
}
