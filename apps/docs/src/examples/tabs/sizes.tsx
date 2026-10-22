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

type TabsSize = 'sm' | 'md' | 'lg';

const sizes = [
  { value: 'sm', label: '小尺寸' },
  { value: 'md', label: '默认尺寸' },
  { value: 'lg', label: '大尺寸' },
] as const;

export function TabsSizes() {
  const [size, setSize] = useState<TabsSize>('md');
  const sizeLabel = sizes.find((option) => option.value === size)?.label;

  return (
    <Space direction="vertical" align="stretch" size="lg">
      <RadioGroup
        label="标签尺寸"
        name="tabs-size"
        value={size}
        onChange={(event) => setSize(event.target.value as TabsSize)}
        options={sizes}
      />
      <Tabs aria-label={`项目信息 · ${sizeLabel}`} items={items} size={size} />
    </Space>
  );
}
