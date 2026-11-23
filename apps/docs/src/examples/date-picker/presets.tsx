import { DatePicker } from '@ifhover/leaf-ui';

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function DatePickerPresets() {
  return <DatePicker aria-label="交付日期" presets={[{ label: '明天', value: tomorrow }]} />;
}
