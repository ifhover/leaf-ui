import { Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: '概览', children: '概览内容' },
  { key: 'settings', label: '设置', children: '设置内容' },
];
export function TabsSizes() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">小尺寸</Text>
        <Tabs aria-label="小尺寸" size="sm" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">默认尺寸</Text>
        <Tabs aria-label="默认尺寸" size="md" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">大尺寸</Text>
        <Tabs aria-label="大尺寸" size="lg" items={items} />
      </Space>
    </Space>
  );
}
