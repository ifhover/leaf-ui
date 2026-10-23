import { Card, Flex } from '@ifhover/leaf-ui';

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
    <Flex direction="column" align="center" gap="lg">
      <Card title="Small" size="sm" tabs={{ items }} style={{ width: 300, maxWidth: '100%' }} />
      <Card title="Default" tabs={{ items }} style={{ width: 380, maxWidth: '100%' }} />
      <Card title="Large" size="lg" tabs={{ items }} style={{ width: 460, maxWidth: '100%' }} />
    </Flex>
  );
}
