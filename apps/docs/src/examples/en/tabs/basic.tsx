import type { TabItem } from '@ifhover/leaf-ui';
import { Input, Tabs } from '@ifhover/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';

const items: readonly TabItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <ChartNoAxesColumn />,
    children: 'View project activity, members and recent updates.',
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings />,
    children: <Input aria-label="Project name" placeholder="Type and switch; your draft is kept" />,
  },
  { key: 'history', label: 'History', disabled: true, children: null },
];

export function TabsBasic() {
  return <Tabs aria-label="Project information" items={items} />;
}
