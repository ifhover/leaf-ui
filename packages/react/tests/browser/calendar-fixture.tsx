import { Calendar, DatePicker, DateRangePicker, DateTimePicker } from '@ifhover/leaf-ui';
import { useState } from 'react';

const today = new Date();
const selected = new Date(today.getFullYear(), today.getMonth(), today.getDate() === 1 ? 2 : 1);

export function CalendarFixture() {
  const [value, setValue] = useState(selected);
  return (
    <div className="calendar-fixture">
      <Calendar
        aria-label="Full calendar"
        value={value}
        onChange={setValue}
        cellRender={(date) =>
          date.getMonth() === selected.getMonth() && date.getDate() === 8 ? 'Design review' : null
        }
      />
      <Calendar aria-label="Compact calendar" fullscreen={false} defaultValue={selected} />
      <DatePicker aria-label="Date popup" defaultValue={selected} />
      <DateTimePicker aria-label="Date time popup" defaultValue={selected} />
      <DateRangePicker
        aria-label="Date range popup"
        defaultValue={[selected, new Date(selected.getFullYear(), selected.getMonth(), 12)]}
      />
    </div>
  );
}
