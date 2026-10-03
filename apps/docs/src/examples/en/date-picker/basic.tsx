import { DatePicker } from '@sudden3/leaf-ui';

export function DatePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <DatePicker aria-label="Choose a date" placeholder="Pick a good day" />
      <DatePicker aria-label="Default date" defaultValue={new Date(2026, 9, 15)} />
      <DatePicker aria-label="Disabled date" defaultValue={new Date(2026, 9, 15)} disabled />
    </div>
  );
}
