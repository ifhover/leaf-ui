import { Input, type TabItem, Tabs } from '@sudden3/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';

const items: readonly TabItem[] = [
  {
    key: 'overview',
    label: '概览',
    icon: <ChartNoAxesColumn />,
    children: <p>查看项目活动、成员和最近更新。</p>,
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
  return (
    <div className="leaf-demo-stack leaf-demo-stack--wide">
      <Tabs aria-label="项目信息" items={items} />
      <Tabs items={items} type="card" size="sm" />
      <Tabs items={items} placement="left" />
    </div>
  );
}
