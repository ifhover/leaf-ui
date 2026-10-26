import { Button, Calendar, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

function formatDate(date: Date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-');
}

export function CalendarControlled() {
  const [value, setValue] = useState(new Date(2026, 9, 15));
  const [visibleDate, setVisibleDate] = useState(new Date(2026, 9, 1));

  return (
    <Flex direction="column" gap="md">
      <Calendar
        value={value}
        onChange={setValue}
        visibleDate={visibleDate}
        onVisibleChange={setVisibleDate}
        headerExtra={
          <Button size="sm" onClick={() => setVisibleDate(value)}>
            查看所选月份
          </Button>
        }
      />
      <Text tone="muted" role="status">
        已选日期：{formatDate(value)}
      </Text>
    </Flex>
  );
}
