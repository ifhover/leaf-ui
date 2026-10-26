import { Tabs } from '@ifhover/leaf-ui';

const items = [
  { key: 'overview', label: 'Overview', children: 'Overview content' },
  { key: 'settings', label: 'Settings', children: 'Settings content' },
];

export function Capabilities() {
  return <Tabs aria-label="Bottom tabs" placement="bottom" items={items} />;
}
