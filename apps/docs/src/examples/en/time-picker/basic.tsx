import { TimePicker } from '@sudden3/leaf-ui';

export function TimePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <TimePicker aria-label="Choose a time" />
      <TimePicker aria-label="Default time" defaultValue="09:30" />
      <TimePicker aria-label="Disabled time" defaultValue="18:00" disabled />
    </div>
  );
}
