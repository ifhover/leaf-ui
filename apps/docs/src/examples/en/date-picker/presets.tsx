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
      <FormField label="Delivery date">
        <DatePicker presets={[{ label: 'Tomorrow', value: tomorrow }]} />
      </FormField>
    </Form>
  );
}
