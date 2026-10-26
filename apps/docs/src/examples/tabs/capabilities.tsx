import { Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: '概览', children: '概览内容' },
  { key: 'settings', label: '设置', children: '设置内容' },
];

export function Capabilities() {
  return <Tabs aria-label="底部标签" placement="bottom" items={items} />;
}
