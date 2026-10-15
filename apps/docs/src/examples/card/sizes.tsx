import { Card, Space } from '@ifhover/leaf-ui';

export function CardSizes() {
  const items = [
    { key: 'overview', label: '概览', children: '整理项目资料，让设计与开发围绕同一份计划协作。' },
    {
      key: 'activity',
      label: '最近动态',
      children: '今天更新了组件规范，并邀请两位成员加入项目。',
    },
  ];
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Card title="小尺寸" size="sm" tabs={{ items }} />
      <Card title="默认尺寸" tabs={{ items }} />
      <Card title="大尺寸" size="lg" tabs={{ items }} />
    </Space>
  );
}
