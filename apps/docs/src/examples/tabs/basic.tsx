import type { TabItem } from '@ifhover/leaf-ui';
import { Input, Tabs } from '@ifhover/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';

const items: readonly TabItem[] = [
  {
    key: 'overview',
    label: '概览',
    icon: <ChartNoAxesColumn />,
    children: '查看项目活动、成员和最近更新。',
  },
  {
    key: 'settings',
    label: '设置',
    icon: <Settings />,
    children: <Input aria-label="项目名称" placeholder="输入内容后切换，内容会保留" />,
  },
  { key: 'history', label: '历史', disabled: true, children: null },
];

export function TabsBasic() {
  return <Tabs aria-label="项目信息" items={items} />;
}
