import { TimeRangePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function TimeRangePickerBasic() {
  const [value, setValue] = useState<import('@sudden3/leaf-ui').TimeRange | null>([
    '09:00',
    '18:00',
  ]);
  return (
    <div className="leaf-demo-stack">
      <TimeRangePicker value={value} onChange={setValue} />
      <output className="leaf-demo-note">{value?.join(' ~ ') || '—'}</output>
    </div>
  );
}
