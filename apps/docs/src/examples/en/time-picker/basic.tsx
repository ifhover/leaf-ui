import { TimePicker } from '@sudden3/leaf-ui';

export function TimePickerBasic() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Choose a time</span>
        <TimePicker aria-label="Choose a time" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Default time</span>
        <TimePicker aria-label="Default time" defaultValue="09:30" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Disabled time</span>
        <TimePicker aria-label="Disabled time" defaultValue="18:00" disabled />
      </div>
    </div>
  );
}
