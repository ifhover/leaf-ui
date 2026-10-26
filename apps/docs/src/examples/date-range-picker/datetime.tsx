import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerDateTime() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="预约时段">
        <DateRangePicker picker="datetime" defaultTime={['09:00', '18:00']} minuteStep={15} />
      </FormField>
    </Form>
  );
}
