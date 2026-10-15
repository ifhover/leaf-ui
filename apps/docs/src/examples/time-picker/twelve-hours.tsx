import { Form, FormField, TimePicker } from '@ifhover/leaf-ui';
export function TimePickerTwelveHours() {
  return (
    <Form layout="vertical">
      <FormField label="12小时制">
        <TimePicker aria-label="12小时制" use12Hours defaultValue="14:30" />
      </FormField>
      <FormField label="精确到秒">
        <TimePicker
          aria-label="精确到秒"
          use12Hours
          showSeconds
          secondStep={10}
          defaultValue="00:05:30"
        />
      </FormField>
    </Form>
  );
}
