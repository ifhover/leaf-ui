import { TimePicker } from '@sudden3/leaf-ui';
export function TimePickerTwelveHours() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">12-hour clock</span>
        <TimePicker aria-label="12-hour clock" use12Hours defaultValue="14:30" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Include seconds</span>
        <TimePicker
          aria-label="Include seconds"
          use12Hours
          showSeconds
          secondStep={10}
          defaultValue="00:05:30"
        />
      </div>
    </div>
  );
}
