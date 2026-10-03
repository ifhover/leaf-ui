import { DateTimePicker } from '@sudden3/leaf-ui';
export function DateTimePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <DateTimePicker aria-label="预约时间" defaultValue={new Date(2026, 9, 3, 14, 30)} />
      <DateTimePicker aria-label="12小时预约时间" use12Hours minuteStep={15} secondStep={10} />
      <DateTimePicker
        aria-label="限定时间"
        minDate={new Date(2026, 9, 1)}
        maxDate={new Date(2026, 9, 31, 23, 59, 59)}
        placeholder="选择十月的时间"
      />
    </div>
  );
}
