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
      <Text>Custom date shortcuts</Text>
      <DatePicker
        aria-label="Custom date shortcuts"
        value={value}
        onChange={setValue}
        todayText="Today"
        renderExtraFooter={
          <Button variant="ghost" size="sm" onClick={tomorrow}>
            Tomorrow
          </Button>
        }
      />
    </Flex>
  );
}
