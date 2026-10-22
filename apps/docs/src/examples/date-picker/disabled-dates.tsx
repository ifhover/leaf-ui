import { DatePicker } from '@ifhover/leaf-ui';

export function DisabledDates({ english = false }) {
  return (
    <DatePicker
      aria-label={english ? 'Weekday delivery date' : '工作日送达日期'}
      disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
      placeholder={english ? 'Weekdays only' : '仅可选择工作日'}
    />
  );
}
