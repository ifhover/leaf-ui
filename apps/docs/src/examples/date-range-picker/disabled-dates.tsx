import { DateRangePicker } from '@ifhover/leaf-ui';

export function DisabledDates({ english = false }) {
  return (
    <DateRangePicker
      aria-label={english ? 'Delivery window, Sundays excluded' : '交付周期，周日不可选'}
      disabledDate={(date) => date.getDay() === 0}
      placeholder={english ? 'Sundays are unavailable' : '周日不可选'}
    />
  );
}
