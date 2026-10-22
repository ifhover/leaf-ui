import { DateRangePicker } from '@ifhover/leaf-ui';

const recentSevenDays = (): [Date, Date] => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return [start, end];
};

export function Presets({ english = false }) {
  return (
    <DateRangePicker
      aria-label={english ? 'Reporting range' : '统计区间'}
      placeholder={english ? 'Pick a reporting range' : '选择统计区间'}
      presets={[{ label: english ? 'Recent 7 days' : '最近七天', value: recentSevenDays }]}
    />
  );
}
