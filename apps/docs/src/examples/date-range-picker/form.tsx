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
      <FormField label="报表周期">
        <DateRangePicker
          name="reportingRange"
          format="DD/MM/YYYY"
          defaultValue={[new Date(2026, 9, 5), new Date(2026, 9, 9)]}
        />
      </FormField>
      <Space>
        <Button type="submit">提交</Button>
        <Button type="reset">重置</Button>
      </Space>
      <Text tone="muted" role="status">
        FormData：{submitted === null ? '尚未提交' : JSON.stringify(submitted)}
      </Text>
    </Form>
  );
}
