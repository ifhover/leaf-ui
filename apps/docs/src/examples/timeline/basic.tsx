import { Timeline } from '@sudden3/leaf-ui';

export function TimelineBasic() {
  return (
    <Timeline
      items={[
        { key: 'create', label: '09:00', children: '创建项目', color: 'success' },
        { key: 'review', label: '10:30', children: '完成审核' },
        { key: 'release', label: '12:00', children: '发布成功', color: 'info' },
      ]}
    />
  );
}
