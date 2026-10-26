import { Space, Tabs, Text } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: '概览', children: '概览内容' },
  { key: 'settings', label: '设置', children: '设置内容' },
];
export function TabsAppearances() {
  return (
    <Space direction="vertical" align="stretch" size="lg">
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">线形</Text>
        <Tabs aria-label="线形" type="line" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">卡片</Text>
        <Tabs aria-label="卡片" type="card" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <Text tone="muted">分段</Text>
        <Tabs aria-label="分段" type="segmented" items={items} />
      </Space>
    </Space>
  );
}
