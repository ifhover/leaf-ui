import { TimePicker } from '@leaf-ui/react';
import { useState } from 'react';

export function TimePickerControlled() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <div className="leaf-demo-stack">
      <TimePicker aria-label="会议时间" value={time} onChange={setTime} minuteStep={15} />
      <span className="leaf-demo-note">以 15 分钟为间隔，当前值：{time || '未选择'}</span>
      <TimePicker aria-label="保留时间" defaultValue="08:07" minuteStep={15} allowClear={false} />
    </div>
  );
}
