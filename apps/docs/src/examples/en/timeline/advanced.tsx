import { Timeline } from '@sudden3/leaf-ui';

export function TimelineAlternate() {
  return (
    <Timeline
      mode="alternate"
      pending="Waiting for the next step"
      items={[
        { key: 'one', label: '2026-10-01', children: 'Requirements approved' },
        { key: 'two', label: '2026-10-03', children: 'Design started', color: 'warning' },
      ]}
    />
  );
}
