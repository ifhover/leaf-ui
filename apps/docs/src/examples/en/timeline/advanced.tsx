import { Timeline } from '@ifhover/leaf-ui';

export function TimelineAlternate() {
  return (
    <Timeline
      mode="alternate"
      items={[
        { key: 'create', label: '09:00', children: 'Project created' },
        { key: 'review', label: '10:30', children: 'Review complete' },
        { key: 'release', label: '12:00', children: 'Published' },
      ]}
    />
  );
}
