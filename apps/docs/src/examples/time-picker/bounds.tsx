import { DatePicker, Form, FormField } from '@ifhover/leaf-ui';

export function TimePickerBounds({ english = false }) {
  return (
    <Form layout="vertical">
      <FormField label={english ? 'Office hours' : '办公时间'}>
        <DatePicker
          picker="time"
          aria-label={english ? 'Office hours' : '办公时间'}
          minTime="09:00"
          maxTime="18:00"
          minuteStep={15}
          placeholder={english ? 'Between 09:00 and 18:00' : '09:00 至 18:00'}
        />
      </FormField>
      <FormField label={english ? 'Confirm before saving' : '确认后保存'}>
        <DatePicker
          picker="time"
          aria-label={english ? 'Confirm before saving' : '确认后保存'}
          defaultValue="10:30"
          needConfirm
        />
      </FormField>
    </Form>
  );
}
