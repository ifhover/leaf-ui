import { Timeline } from '@sudden3/leaf-ui';

export function TimelineAlternate() {
  return (
    <Timeline
      mode="alternate"
      pending="等待下一步"
      items={[
        { key: 'one', label: '2026-10-01', children: '需求确认' },
        { key: 'two', label: '2026-10-03', children: '开始设计', color: 'warning' },
      ]}
    />
  );
}
