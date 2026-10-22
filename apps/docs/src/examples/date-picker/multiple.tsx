import { DatePicker } from '@ifhover/leaf-ui';

export function Multiple({ english = false }) {
  return (
    <DatePicker
      aria-label={english ? 'Sprint dates' : '迭代日期'}
      multiple
      placeholder={english ? 'Select several dates' : '选择多个日期'}
    />
  );
}
