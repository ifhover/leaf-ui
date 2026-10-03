import { TimePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function TimePickerControlled() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <div className="leaf-demo-stack">
      <TimePicker aria-label="Meeting time" value={time} onChange={setTime} minuteStep={15} />
      <span className="leaf-demo-note">15-minute steps. Current:{time || 'Not selected'}</span>
      <TimePicker
        aria-label="Preserved time"
        defaultValue="08:07"
        minuteStep={15}
        allowClear={false}
      />
    </div>
  );
}
