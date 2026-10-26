import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DatePickerCard() {
  return (
    <Form layout="vertical">
      <FormField label="Date">
        <DatePicker panelVariant="card" defaultValue={new Date(2026, 9, 15)} />
      </FormField>
      <FormField label="Time">
        <DatePicker picker="time" panelVariant="card" defaultValue="10:30" />
      </FormField>
    </Form>
  );
}
