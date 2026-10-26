import { Button, DatePicker, Form, FormField, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function Format() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form
      layout="vertical"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('meetingDate') ?? ''));
      }}
      onReset={() => setSubmitted(null)}
    >
      <FormField label="Meeting date">
        <DatePicker name="meetingDate" format="DD/MM/YYYY" defaultValue={new Date(2026, 9, 15)} />
      </FormField>
      <Space>
        <Button type="submit">Submit</Button>
        <Button type="reset">Reset</Button>
      </Space>
      <Text tone="muted" role="status">
        FormData: {submitted === null ? 'Not submitted' : JSON.stringify(submitted)}
      </Text>
    </Form>
  );
}
