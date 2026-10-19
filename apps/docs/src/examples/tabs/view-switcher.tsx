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
        aria-label="统计周期"
        activeKey={view}
        onChange={setView}
        items={[
          { key: 'week', label: '本周', icon: <CalendarDays /> },
          { key: 'month', label: '本月', icon: <ChartNoAxesColumn /> },
          { key: 'year', label: '全年', disabled: true },
        ]}
      />
      <Text>{view === 'week' ? '本周新增 12 个项目。' : '本月新增 36 个项目。'}</Text>
    </Flex>
  );
}
