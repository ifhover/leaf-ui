import { DatePicker } from '@ifhover/leaf-ui';

const tomorrowAtTen = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return date;
};

export function Presets({ english = false }) {
  return (
    <DatePicker
      picker="datetime"
      aria-label={english ? 'Reminder time' : '提醒时间'}
      placeholder={english ? 'Pick a reminder time' : '选择提醒时间'}
      presets={[{ label: english ? 'Tomorrow at 10' : '明天十点', value: tomorrowAtTen }]}
    />
  );
}
