import { DateRangePicker, Flex, type OpenDateRange, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function OpenEnd() {
  const [value, setValue] = useState<OpenDateRange | null>([new Date(2026, 9, 5), null]);
  const [texts, setTexts] = useState<readonly [string, string]>(['2026-10-05', '']);

  return (
    <Flex direction="column" gap="sm" align="start">
      <DateRangePicker
        aria-label="Ongoing project period"
        allowEmpty={[false, true]}
        value={value}
        onChange={(next: OpenDateRange | null, dateStrings: readonly [string, string]) => {
          setValue(next);
          setTexts(dateStrings);
        }}
      />
      <Text tone="muted" role="status">
        Start: {texts[0] || 'Empty'}; end: {texts[1] || 'Empty'}
      </Text>
    </Flex>
  );
}
