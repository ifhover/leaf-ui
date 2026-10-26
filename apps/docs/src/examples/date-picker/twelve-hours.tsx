import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerTwelveHours() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="12 小时制">
        <DatePicker picker="time" use12Hours defaultValue="14:30" />
      </FormField>
      <FormField label="精确到秒">
        <DatePicker picker="time" use12Hours showSeconds secondStep={10} defaultValue="00:05:30" />
      </FormField>
    </Form>
  );
}
