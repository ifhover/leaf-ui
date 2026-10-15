import type { TabItem } from '@ifhover/leaf-ui';
import { Input, Space, Tabs } from '@ifhover/leaf-ui';
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
  return (
    <Space direction="vertical" align="stretch">
      <Space direction="vertical" align="stretch" size="sm">
        <span>Line tabs</span>
        <Tabs aria-label="Project information" items={items} />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <span>Card tabs</span>
        <Tabs aria-label="Card tabs" items={items} type="card" />
      </Space>
      <Space direction="vertical" align="stretch" size="sm">
        <span>Vertical tabs</span>
        <Tabs aria-label="Vertical tabs" items={items} placement="left" />
      </Space>
    </Space>
  );
}
