import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="默认日期">
        <DatePicker defaultValue={new Date(2026, 9, 15)} />
      </FormField>
    </Form>
  );
}
