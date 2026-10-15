import { Card, Space } from '@ifhover/leaf-ui';

export function CardSizes() {
  const items = [
    {
      key: 'overview',
      label: 'Overview',
      children: 'Keep project details, design and development working from the same plan.',
    },
    {
      key: 'activity',
      label: 'Activity',
      children: 'Updated the component guidelines and invited two teammates today.',
    },
  ];
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Card title="Small" size="sm" tabs={{ items }} />
      <Card title="Default" tabs={{ items }} />
      <Card title="Large" size="lg" tabs={{ items }} />
    </Space>
  );
}
