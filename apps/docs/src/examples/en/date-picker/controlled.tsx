import { Button, DatePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialDate = new Date(2026, 9, 15);

export function DatePickerControlled() {
  const [value, setValue] = useState<Date | null>(initialDate);
  const [dateString, setDateString] = useState('2026-10-15');

  return (
    <Form
      layout="vertical"
      onSubmit={(event) => event.preventDefault()}
      onReset={() => {
        setValue(initialDate);
        setDateString('2026-10-15');
      }}
    >
      <FormField label="Deadline">
        <DatePicker
          value={value}
          onChange={(next, text) => {
            setValue(next);
            setDateString(text);
          }}
        />
      </FormField>
      <Text tone="muted" role="status">
        Callback text: {dateString || 'Empty string'}
      </Text>
      <Button type="reset">Reset</Button>
    </Form>
  );
}
