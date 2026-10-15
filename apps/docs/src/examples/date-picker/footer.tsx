import { Button, DatePicker, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function DatePickerFooter() {
  const [value, setValue] = useState<Date | null>(null);
  const tomorrow = () => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    setValue(next);
  };
  return (
    <Flex direction="column" gap="sm" align="start">
      <Text>自定义快捷日期</Text>
      <DatePicker
        aria-label="自定义快捷日期"
        value={value}
        onChange={setValue}
        todayText="今天"
        renderExtraFooter={
          <Button variant="ghost" size="sm" onClick={tomorrow}>
            明天
          </Button>
        }
      />
    </Flex>
  );
}
