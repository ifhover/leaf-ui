import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function DatePickerPresets() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="交付日期">
        <DatePicker presets={[{ label: '明天', value: tomorrow }]} />
      </FormField>
    </Form>
  );
}
