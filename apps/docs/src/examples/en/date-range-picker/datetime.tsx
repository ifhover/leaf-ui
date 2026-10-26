import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerDateTime() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Booking window">
        <DateRangePicker picker="datetime" defaultTime={['09:00', '18:00']} minuteStep={15} />
      </FormField>
    </Form>
  );
}
