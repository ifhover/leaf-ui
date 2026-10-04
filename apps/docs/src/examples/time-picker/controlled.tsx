import { TimePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function TimePickerControlled() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <div className="leaf-demo-stack">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">会议时间</span>
        <TimePicker aria-label="会议时间" value={time} onChange={setTime} minuteStep={15} />
      </div>
      <span className="leaf-demo-note">以 15 分钟为间隔，当前值：{time || '未选择'}</span>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">保留不符合间隔的已有值</span>
        <TimePicker aria-label="保留时间" defaultValue="08:07" minuteStep={15} allowClear={false} />
      </div>
    </div>
  );
}
