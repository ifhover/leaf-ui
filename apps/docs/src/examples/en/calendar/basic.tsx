import { Calendar, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const events: Record<number, { label: string; color: string }> = {
  8: { label: 'Review', color: '#20834a' },
  15: { label: 'Release', color: '#1677ff' },
  22: { label: 'Design sync', color: '#7654c6' },
};
export function CalendarBasic() {
  const [value, setValue] = useState(new Date(2026, 9, 4));
  return (
    <Space direction="vertical" align="stretch">
      <Calendar
        value={value}
        onChange={setValue}
        cellRender={(date) => {
          const event = date.getMonth() === 9 ? events[date.getDate()] : undefined;
          return event ? <Text style={{ color: event.color }}>{event.label}</Text> : null;
        }}
      />
      <output>
        <Text tone="muted">
          Selected date: {value.getFullYear()}-{value.getMonth() + 1}-{value.getDate()}
        </Text>
      </output>
    </Space>
  );
}
