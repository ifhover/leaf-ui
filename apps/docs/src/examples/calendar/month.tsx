import { Calendar } from '@sudden3/leaf-ui';
export function CalendarMonth() {
  return <Calendar fullscreen={false} mode="month" defaultValue={new Date(2026, 9, 1)} />;
}
