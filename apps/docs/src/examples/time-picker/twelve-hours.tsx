import { TimePicker } from '@sudden3/leaf-ui';
export function TimePickerTwelveHours() {
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">12小时制</span>
        <TimePicker aria-label="12小时制" use12Hours defaultValue="14:30" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">精确到秒</span>
        <TimePicker
          aria-label="精确到秒"
          use12Hours
          showSeconds
          secondStep={10}
          defaultValue="00:05:30"
        />
      </div>
    </div>
  );
}
