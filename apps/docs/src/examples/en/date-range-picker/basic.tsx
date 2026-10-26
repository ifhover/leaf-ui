import { DateRangePicker, Form, FormField } from '@ifhover/leaf-ui';

export function DateRangePickerBasic() {
  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Date range">
        <DateRangePicker />
      </FormField>
    </Form>
  );
}
