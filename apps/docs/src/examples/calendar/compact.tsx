import { Calendar } from '@ifhover/leaf-ui';

export function CalendarCompact() {
  return (
    <Calendar
      fullscreen={false}
      defaultValue={new Date(2026, 9, 6)}
      disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6}
    />
  );
}
