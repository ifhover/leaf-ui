import { DateRangePicker, Flex, type OpenDateRange, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function OpenEnd() {
  const [value, setValue] = useState<OpenDateRange | null>([new Date(2026, 9, 5), null]);
  const [texts, setTexts] = useState<readonly [string, string]>(['2026-10-05', '']);

  return (
    <Flex direction="column" gap="sm" align="start">
      <DateRangePicker
        aria-label="进行中的项目周期"
        allowEmpty={[false, true]}
        value={value}
        onChange={(next: OpenDateRange | null, dateStrings: readonly [string, string]) => {
          setValue(next);
          setTexts(dateStrings);
        }}
      />
      <Text tone="muted" role="status">
        起点：{texts[0] || '空'}；终点：{texts[1] || '空'}
      </Text>
    </Flex>
  );
}
