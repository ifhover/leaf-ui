import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerTwelveHours() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="12-hour clock">
        <DatePicker picker="time" use12Hours defaultValue="14:30" />
      </FormField>
      <FormField label="Include seconds">
        <DatePicker picker="time" use12Hours showSeconds secondStep={10} defaultValue="00:05:30" />
      </FormField>
    </Form>
  );
}
