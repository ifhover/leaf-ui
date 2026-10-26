import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';
export function DateTimePickerBasic() {
  return (
    <Form layout="vertical">
      <FormField label="预约时间">
        <DatePicker
          picker="datetime"
          aria-label="预约时间"
          defaultValue={new Date(2026, 9, 3, 14, 30)}
        />
      </FormField>
      <FormField label="12小时预约时间">
        <DatePicker
          picker="datetime"
          aria-label="12小时预约时间"
          use12Hours
          minuteStep={15}
          secondStep={10}
        />
      </FormField>
      <FormField label="限定时间">
        <DatePicker
          picker="datetime"
          aria-label="限定时间"
          minDate={new Date(2026, 9, 1)}
          maxDate={new Date(2026, 9, 31, 23, 59, 59)}
          placeholder="选择十月的时间"
        />
      </FormField>
    </Form>
  );
}
