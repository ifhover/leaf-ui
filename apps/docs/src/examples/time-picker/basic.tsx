import { Form, FormField, TimePicker } from '@ifhover/leaf-ui';

export function TimePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="选择时间">
        <TimePicker aria-label="选择时间" />
      </FormField>
      <FormField label="默认时间">
        <TimePicker aria-label="默认时间" defaultValue="09:30" />
      </FormField>
      <FormField label="禁用时间">
        <TimePicker aria-label="禁用时间" defaultValue="18:00" disabled />
      </FormField>
    </Form>
  );
}
