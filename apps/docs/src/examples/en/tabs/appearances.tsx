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

type TabsAppearance = 'line' | 'card' | 'segmented';

const appearances = [
  { value: 'line', label: 'Line' },
  { value: 'card', label: 'Card' },
  { value: 'segmented', label: 'Segmented' },
] as const;

export function TabsAppearances() {
  const [appearance, setAppearance] = useState<TabsAppearance>('line');
  const appearanceLabel = appearances.find((option) => option.value === appearance)?.label;

  return (
    <Space direction="vertical" align="stretch" size="lg">
      <RadioGroup
        label="Tab style"
        name="tabs-appearance"
        value={appearance}
        onChange={(event) => setAppearance(event.target.value as TabsAppearance)}
        options={appearances}
      />
      <Tabs aria-label={`${appearanceLabel} tabs`} items={items} type={appearance} />
    </Space>
  );
}
