import { Flex, Tabs, Text } from '@ifhover/leaf-ui';
import { CalendarDays, ChartNoAxesColumn } from 'lucide-react';
import { useState } from 'react';

export function TabsViewSwitcher() {
  const [view, setView] = useState('week');
  return (
    <Flex direction="column" gap={16}>
      <Tabs
        type="card"
        block
        aria-label="Statistics period"
        activeKey={view}
        onChange={setView}
        items={[
          { key: 'week', label: 'Week', icon: <CalendarDays /> },
          { key: 'month', label: 'Month', icon: <ChartNoAxesColumn /> },
          { key: 'year', label: 'Year', disabled: true },
        ]}
      />
      <Text>{view === 'week' ? '12 new projects this week.' : '36 new projects this month.'}</Text>
    </Flex>
  );
}
