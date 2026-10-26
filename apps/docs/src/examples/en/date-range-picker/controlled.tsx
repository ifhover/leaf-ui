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
  const [draft, setDraft] = useState('Not adjusted');

  return (
    <Form
      layout="vertical"
      onSubmit={(event) => event.preventDefault()}
      onReset={() => {
        setValue(initialRange);
        setCommitted('2026-10-05 ~ 2026-10-09');
        setDraft('Not adjusted');
      }}
    >
      <FormField label="Controlled date range">
        <DateRangePicker
          value={value}
          onChange={(next: DateRange | null, texts: readonly [string, string]) => {
            setValue(next);
            setCommitted(next ? texts.join(' ~ ') : 'Empty');
          }}
          onCalendarChange={(next, { position }) => {
            setDraft(`${position}: ${next.map(formatDate).join(' ~ ')}`);
          }}
        />
      </FormField>
      <Text tone="muted" role="status">
        Committed: {committed}
      </Text>
      <Text tone="muted" role="status">
        Latest panel edit: {draft}
      </Text>
      <Button type="reset">Reset</Button>
    </Form>
  );
}
