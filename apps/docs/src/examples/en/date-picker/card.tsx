import { DatePicker, Form, FormField, TimePicker } from '@ifhover/leaf-ui';

export function DatePickerCard() {
  return (
    <Form layout="vertical">
      <FormField label="Date">
        <DatePicker panelVariant="card" defaultValue={new Date(2026, 9, 15)} />
      </FormField>
      <FormField label="Time">
        <TimePicker panelVariant="card" defaultValue="10:30" />
      </FormField>
    </Form>
  );
}
