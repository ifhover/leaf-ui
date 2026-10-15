import { Space, Text, TimeRangePicker } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function TimeRangePickerBasic() {
  const [value, setValue] = useState<import('@ifhover/leaf-ui').TimeRange | null>([
    '09:00',
    '18:00',
  ]);
  return (
    <Space direction="vertical" align="stretch">
      <TimeRangePicker value={value} onChange={setValue} />
      <output>
        <Text tone="muted">{value?.join(' ~ ') || '—'}</Text>
      </output>
    </Space>
  );
}
