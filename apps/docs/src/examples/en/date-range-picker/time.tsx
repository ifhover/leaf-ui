import { DateRangePicker, Flex, Text, type TimeRange } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DateRangePickerTime() {
  const [value, setValue] = useState<TimeRange | null>(['09:00', '18:00']);

  return (
    <Flex direction="column" gap="sm" align="start">
      <DateRangePicker aria-label="Working hours" picker="time" value={value} onChange={setValue} />
      <Text tone="muted" role="status">
        Current value: {value ? value.join(' ~ ') : 'Empty'}
      </Text>
    </Flex>
  );
}
