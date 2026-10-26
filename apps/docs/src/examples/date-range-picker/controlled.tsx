import { Button, type DateRange, DateRangePicker, Form, FormField, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const initialRange: DateRange = [new Date(2026, 9, 5), new Date(2026, 9, 9)];

function formatDate(date: Date | null) {
  if (!date) return '-';
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0')))
    .join('-');
}

export function DateRangePickerControlled() {
  const [value, setValue] = useState<DateRange | null>(initialRange);
  const [committed, setCommitted] = useState('2026-10-05 ~ 2026-10-09');
  const [draft, setDraft] = useState('尚未调整');

  return (
    <Form
      layout="vertical"
      onSubmit={(event) => event.preventDefault()}
      onReset={() => {
        setValue(initialRange);
        setCommitted('2026-10-05 ~ 2026-10-09');
        setDraft('尚未调整');
      }}
    >
      <FormField label="受控日期区间">
        <DateRangePicker
          value={value}
          onChange={(next: DateRange | null, texts: readonly [string, string]) => {
            setValue(next);
            setCommitted(next ? texts.join(' ~ ') : '空值');
          }}
          onCalendarChange={(next, { position }) => {
            setDraft(`${position}: ${next.map(formatDate).join(' ~ ')}`);
          }}
        />
      </FormField>
      <Text tone="muted" role="status">
        已提交：{committed}
      </Text>
      <Text tone="muted" role="status">
        最近面板操作：{draft}
      </Text>
      <Button type="reset">重置</Button>
    </Form>
  );
}
