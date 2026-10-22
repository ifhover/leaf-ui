import type { TabItem } from '@ifhover/leaf-ui';
import { Input, RadioGroup, Space, Tabs } from '@ifhover/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';
import { useState } from 'react';

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

type TabsAppearance = 'line' | 'card' | 'segmented';

const appearances = [
  { value: 'line', label: '线形' },
  { value: 'card', label: '卡片' },
  { value: 'segmented', label: '分段' },
] as const;

export function TabsAppearances() {
  const [appearance, setAppearance] = useState<TabsAppearance>('line');
  const appearanceLabel = appearances.find((option) => option.value === appearance)?.label;

  return (
    <Space direction="vertical" align="stretch" size="lg">
      <RadioGroup
        label="标签形态"
        name="tabs-appearance"
        value={appearance}
        onChange={(event) => setAppearance(event.target.value as TabsAppearance)}
        options={appearances}
      />
      <Tabs aria-label={`${appearanceLabel}标签`} items={items} type={appearance} />
    </Space>
  );
}
