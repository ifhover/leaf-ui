import { DatePicker } from '@ifhover/leaf-ui';

export function DisabledDates({ english = false }) {
  return (
    <DatePicker
      picker="datetime"
      aria-label={english ? 'Meeting time, no Sundays' : '会议时间，周日不可选'}
      disabledDate={(date) => date.getDay() === 0}
      placeholder={english ? 'Sundays are unavailable' : '周日不可选'}
    />
  );
}
