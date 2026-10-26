import { Calendar, DatePicker, DateRangePicker, Tag } from '@ifhover/leaf-ui';
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
        cellRender={(date) => {
          if (date.getMonth() !== selected.getMonth()) return null;
          if (date.getDate() === 8) return 'Design review';
          if (date.getDate() === 15) return <Tag color="success">Release</Tag>;
          return null;
        }}
      />
      <Calendar aria-label="Compact calendar" fullscreen={false} defaultValue={selected} />
      <DatePicker aria-label="Date popup" defaultValue={selected} />
      <DatePicker picker="datetime" aria-label="Date time popup" defaultValue={selected} />
      <DateRangePicker
        aria-label="Date range popup"
        defaultValue={[selected, new Date(selected.getFullYear(), selected.getMonth(), 12)]}
      />
    </div>
  );
}
