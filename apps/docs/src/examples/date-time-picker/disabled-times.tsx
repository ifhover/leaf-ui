import { DatePicker } from '@ifhover/leaf-ui';

export function DisabledTimes({ english = false }) {
  return (
    <DatePicker
      picker="datetime"
      aria-label={english ? 'Appointment within business hours' : '营业时间内预约'}
      disabledTime={(parts) => parts.hour < 9 || parts.hour > 18}
      placeholder={english ? 'Between 09:00 and 18:00' : '09:00 至 18:00 之间'}
    />
  );
}
