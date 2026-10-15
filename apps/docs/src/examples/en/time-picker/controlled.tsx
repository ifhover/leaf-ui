import { Form, FormField, Text, TimePicker } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TimePickerControlled() {
  const [time, setTime] = useState<string | null>('14:30');
  return (
    <Form layout="vertical">
      <FormField label="Meeting time">
        <TimePicker aria-label="Meeting time" value={time} onChange={setTime} minuteStep={15} />
      </FormField>
      <Text tone="muted">15-minute steps. Current:{time || 'Not selected'}</Text>
      <FormField label="Preserved time">
        <TimePicker
          aria-label="Preserved time"
          defaultValue="08:07"
          minuteStep={15}
          allowClear={false}
        />
      </FormField>
    </Form>
  );
}
