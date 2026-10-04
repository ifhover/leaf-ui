import { Timeline } from '@sudden3/leaf-ui';

export function TimelineBasic() {
  return (
    <Timeline
      items={[
        { key: 'create', label: '09:00', children: 'Project created', color: 'success' },
        { key: 'review', label: '10:30', children: 'Review complete' },
        { key: 'release', label: '12:00', children: 'Published', color: 'info' },
      ]}
    />
  );
}
