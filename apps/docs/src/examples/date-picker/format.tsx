import { DatePicker } from '@ifhover/leaf-ui';

export function Format({ english = false }) {
  return (
    <DatePicker
      aria-label={english ? 'Meeting date' : '会议日期'}
      format="DD/MM/YYYY"
      placeholder={english ? 'DD/MM/YYYY' : '日/月/年'}
    />
  );
}
