import type { TabItem } from '@ifhover/leaf-ui';
import { Input, RadioGroup, Space, Tabs } from '@ifhover/leaf-ui';
import { ChartNoAxesColumn, Settings } from 'lucide-react';
import { useState } from 'react';

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

type TabsSize = 'sm' | 'md' | 'lg';

const sizes = [
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Default' },
  { value: 'lg', label: 'Large' },
] as const;

export function TabsSizes() {
  const [size, setSize] = useState<TabsSize>('md');
  const sizeLabel = sizes.find((option) => option.value === size)?.label;

  return (
    <Space direction="vertical" align="stretch" size="lg">
      <RadioGroup
        label="Tab size"
        name="tabs-size"
        value={size}
        onChange={(event) => setSize(event.target.value as TabsSize)}
        options={sizes}
      />
      <Tabs aria-label={`Project information · ${sizeLabel}`} items={items} size={size} />
    </Space>
  );
}
