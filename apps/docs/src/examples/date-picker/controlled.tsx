import { DatePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function DatePickerControlled() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
  const [dateString, setDateString] = useState('2026-10-15');
  return (
    <Form layout="vertical">
      <FormField label="十月的日期">
        <DatePicker
          aria-label="十月的日期"
          value={date}
          minDate={new Date(2026, 9, 5)}
          maxDate={new Date(2026, 9, 25)}
          onChange={(next, text) => {
            setDate(next);
            setDateString(text);
          }}
        />
      </FormField>
      <Text tone="muted">可选 10 月 5–25 日，当前值：{dateString || '未选择'}</Text>
      <FormField label="必填日期 · 错误">
        <DatePicker aria-label="必填日期" status="error" required placeholder="请设置截止日期" />
      </FormField>
    </Form>
  );
}
