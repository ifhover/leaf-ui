import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerStates() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="禁用">
        <DatePicker defaultValue={new Date(2026, 9, 15)} disabled />
      </FormField>
      <FormField label="只读">
        <DatePicker defaultValue={new Date(2026, 9, 15)} readOnly />
      </FormField>
      <FormField label="仅面板选择">
        <DatePicker defaultValue={new Date(2026, 9, 15)} inputReadOnly />
      </FormField>
    </Form>
  );
}
