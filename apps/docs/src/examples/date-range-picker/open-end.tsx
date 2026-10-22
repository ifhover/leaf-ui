import { DateRangePicker } from '@ifhover/leaf-ui';

export function OpenEnd({ english = false }) {
  return (
    <DateRangePicker
      allowEmpty={[false, true]}
      aria-label={english ? 'Project range with an open end' : '项目周期，允许结束为空'}
      placeholder={english ? 'Start date, no end date' : '开始日期，结束可为空'}
    />
  );
}
