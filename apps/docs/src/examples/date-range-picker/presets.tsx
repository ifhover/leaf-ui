import { type DateRange, DateRangePicker } from '@ifhover/leaf-ui';

function recentSevenDays(): DateRange {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return [start, end];
}

export function Presets() {
  return (
    <DateRangePicker
      aria-label="统计区间"
      presets={[{ label: '最近七天', value: recentSevenDays }]}
    />
  );
}
