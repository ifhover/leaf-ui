import { DateTimePicker } from '@sudden3/leaf-ui';
export function DateTimePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <DateTimePicker aria-label="Appointment" defaultValue={new Date(2026, 9, 3, 14, 30)} />
      <DateTimePicker aria-label="12-hour appointment" use12Hours minuteStep={15} secondStep={10} />
      <DateTimePicker
        aria-label="Bounded time"
        minDate={new Date(2026, 9, 1)}
        maxDate={new Date(2026, 9, 31, 23, 59, 59)}
        placeholder="Select a time in October"
      />
    </div>
  );
}
