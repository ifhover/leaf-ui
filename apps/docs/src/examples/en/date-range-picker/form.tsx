import { Button, DateRangePicker, Form, FormField, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DateRangePickerForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  return (
    <Form
      layout="vertical"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('reportingRange') ?? ''));
      }}
      onReset={() => setSubmitted(null)}
    >
      <FormField label="Reporting period">
        <DateRangePicker
          name="reportingRange"
          format="DD/MM/YYYY"
          defaultValue={[new Date(2026, 9, 5), new Date(2026, 9, 9)]}
        />
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
