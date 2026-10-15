import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="选择日期">
        <DatePicker aria-label="选择日期" placeholder="选择一个好日子" />
      </FormField>
      <FormField label="默认日期">
        <DatePicker aria-label="默认日期" defaultValue={new Date(2026, 9, 15)} />
      </FormField>
      <FormField label="禁用日期">
        <DatePicker aria-label="禁用日期" defaultValue={new Date(2026, 9, 15)} disabled />
      </FormField>
    </Form>
  );
}
