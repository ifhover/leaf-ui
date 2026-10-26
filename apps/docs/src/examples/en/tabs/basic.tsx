import { Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'settings', label: 'Settings', children: 'Settings content' },
];

export function TabsBasic() {
  return <Tabs aria-label="Content categories" items={items} />;
}
