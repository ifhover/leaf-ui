import { Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: '概览', children: '概览内容' },
  { key: 'settings', label: '设置', children: '设置内容' },
];

export function TabsBasic() {
  return <Tabs aria-label="内容分类" items={items} />;
}
