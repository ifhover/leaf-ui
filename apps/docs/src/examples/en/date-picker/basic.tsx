import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Default date">
        <DatePicker defaultValue={new Date(2026, 9, 15)} />
      </FormField>
    </Form>
  );
}
