import { DatePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DatePickerControlled() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
  const [dateString, setDateString] = useState('2026-10-15');
  return (
    <Form layout="vertical">
      <FormField label="Date in October">
        <DatePicker
          aria-label="Date in October"
          value={date}
          minDate={new Date(2026, 9, 5)}
          maxDate={new Date(2026, 9, 25)}
          onChange={(next, text) => {
            setDate(next);
            setDateString(text);
          }}
        />
      </FormField>
      <Text tone="muted">October 5–25 are available. Current:{dateString || 'Not selected'}</Text>
      <FormField label="Required date · Error">
        <DatePicker
          aria-label="Required date"
          status="error"
          required
          placeholder="Set a deadline"
        />
      </FormField>
    </Form>
  );
}
