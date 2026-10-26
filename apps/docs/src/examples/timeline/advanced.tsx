import { Timeline } from '@ifhover/leaf-ui';

export function TimelineAlternate() {
  return (
    <Timeline
      mode="alternate"
      items={[
        { key: 'create', label: '09:00', children: '创建项目' },
        { key: 'review', label: '10:30', children: '完成审核' },
        { key: 'release', label: '12:00', children: '发布成功' },
      ]}
    />
  );
}
