import { Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'settings', label: 'Settings', children: 'Settings content' },
];
export function TabsAppearances() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Line</Text>
        <Tabs aria-label="Line" type="line" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Card</Text>
        <Tabs aria-label="Card" type="card" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">Segmented</Text>
        <Tabs aria-label="Segmented" type="segmented" items={items} />
      </Space>
    </Space>
  );
}
