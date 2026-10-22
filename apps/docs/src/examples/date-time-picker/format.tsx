import { DateTimePicker } from '@ifhover/leaf-ui';

export function Format({ english = false }) {
  return (
    <DateTimePicker
      aria-label={english ? 'Deployment time' : '发布时间'}
      format="DD/MM/YYYY HH:mm"
      placeholder={english ? 'DD/MM/YYYY HH:mm' : '日/月/年 时:分'}
    />
  );
}
