import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerOvernight() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="夜间值班">
        <DateRangePicker picker="time" allowOvernight defaultValue={['22:00', '06:00']} />
      </FormField>
    </Form>
  );
}
