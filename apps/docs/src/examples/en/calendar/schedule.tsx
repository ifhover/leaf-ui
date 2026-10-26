import { Calendar, Tag } from '@ifhover/leaf-ui';

const events: Record<string, string> = {
  '2026-10-8': 'Review',
  '2026-10-15': 'Release',
  '2026-10-22': 'Sync',
};

export function CalendarSchedule() {
  return (
    <Calendar
      defaultValue={new Date(2026, 9, 4)}
      cellRender={(date) => {
        const event = events[`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`];
        return event ? <Tag>{event}</Tag> : null;
      }}
    />
  );
}
