import { DateRangePicker, Flex, Text, type TimeRange } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DateRangePickerTime() {
  const [value, setValue] = useState<TimeRange | null>(['09:00', '18:00']);

  return (
    <Flex direction="column" gap="sm" align="start">
      <DateRangePicker aria-label="工作时段" picker="time" value={value} onChange={setValue} />
      <Text tone="muted" role="status">
        当前值：{value ? value.join(' ~ ') : '空值'}
      </Text>
    </Flex>
  );
}
