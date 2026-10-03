import { DatePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function DatePickerControlled() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
  const [dateString, setDateString] = useState('2026-10-15');
  return (
    <div className="leaf-demo-stack">
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
      <span className="leaf-demo-note">可选 10 月 5–25 日，当前值：{dateString || '未选择'}</span>
      <DatePicker aria-label="必填日期" status="error" required placeholder="请设置截止日期" />
    </div>
  );
}
