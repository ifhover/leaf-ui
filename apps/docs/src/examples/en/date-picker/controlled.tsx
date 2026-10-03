import { DatePicker } from '@sudden3/leaf-ui';
import { useState } from 'react';

export function DatePickerControlled() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 9, 15));
  const [dateString, setDateString] = useState('2026-10-15');
  return (
    <div className="leaf-demo-stack">
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
      <span className="leaf-demo-note">
        October 5–25 are available. Current:{dateString || 'Not selected'}
      </span>
      <DatePicker aria-label="Required date" status="error" required placeholder="Set a deadline" />
    </div>
  );
}
