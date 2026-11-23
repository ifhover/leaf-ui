import { Button, DatePicker, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialDate = new Date(2026, 9, 15);

export function DatePickerControlled() {
  const [value, setValue] = useState<Date | null>(initialDate);
  const [dateString, setDateString] = useState('2026-10-15');

  return (
    <Flex direction="column" gap="sm" align="start">
      <DatePicker
        aria-label="截止日期"
        value={value}
        onChange={(next, text) => {
          setValue(next);
          setDateString(text);
        }}
      />
      <Text tone="muted" role="status">
        回调文本：{dateString || '空字符串'}
      </Text>
      <Button
        onClick={() => {
          setValue(initialDate);
          setDateString('2026-10-15');
        }}
      >
        重置
      </Button>
    </Flex>
  );
}
