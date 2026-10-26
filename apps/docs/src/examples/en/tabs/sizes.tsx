import { Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'settings', label: 'Settings', children: 'Settings content' },
];
export function TabsSizes() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Small</Text>
        <Tabs aria-label="Small" size="sm" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Medium</Text>
        <Tabs aria-label="Medium" size="md" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Large</Text>
        <Tabs aria-label="Large" size="lg" items={items} />
      </Space>
    </Space>
  );
}
