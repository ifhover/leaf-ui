import { Input, type TabItem, Tabs } from '@sudden3/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';

const items: readonly TabItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    icon: <ChartNoAxesColumn />,
    children: <p>View project activity, members and recent updates.</p>,
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: <Settings />,
    children: (
      <Input
        aria-label="Project name"
        placeholder="Type, switch tabs, and your draft is preserved"
      />
    ),
  },
  { key: 'history', label: 'History', disabled: true, children: null },
];
export function TabsBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Tabs aria-label="Project information" items={items} />
      <Tabs items={items} type="card" size="sm" />
      <Tabs items={items} placement="left" />
    </div>
  );
}
