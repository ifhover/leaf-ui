import { DateRangePicker, Form, FormField, Text, type TimeRange } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DateRangePickerTime() {
  const [value, setValue] = useState<TimeRange | null>(['09:00', '18:00']);

  return (
    <Form layout="vertical" onSubmit={(event) => event.preventDefault()}>
      <FormField label="Working hours">
        <DateRangePicker picker="time" value={value} onChange={setValue} />
      </FormField>
      <Text tone="muted" role="status">
        Current value: {value ? value.join(' ~ ') : 'Empty'}
      </Text>
    </Form>
  );
}
