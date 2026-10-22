import { DatePicker } from '@ifhover/leaf-ui';

export function MaxCount({ english = false }) {
  return (
    <DatePicker
      aria-label={english ? 'Review dates, at most three' : '评审日期，最多三个'}
      maxCount={3}
      multiple
      placeholder={english ? 'Select up to three dates' : '最多选择三个日期'}
    />
  );
}
