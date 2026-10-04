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
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Project name</span>
        <Input
          aria-label="Project name"
          placeholder="Type, switch tabs, and your draft is preserved"
        />
      </div>
    ),
  },
  { key: 'history', label: 'History', disabled: true, children: null },
];
export function TabsBasic() {
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Line tabs</span>
        <Tabs aria-label="Project information" items={items} />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Card tabs</span>
        <Tabs items={items} type="card" size="sm" />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">Vertical tabs</span>
        <Tabs items={items} placement="left" />
      </div>
    </div>
  );
}
