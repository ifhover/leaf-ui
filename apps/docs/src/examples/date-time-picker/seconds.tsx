import { DatePicker } from '@ifhover/leaf-ui';

export function Seconds({ english = false }) {
  return (
    <DatePicker
      picker="datetime"
      aria-label={english ? 'Log timestamp' : '日志时间'}
      format="YYYY-MM-DD HH:mm:ss"
      showSeconds
      placeholder={english ? 'Date, hour, minute and second' : '日期、时、分、秒'}
    />
  );
}
