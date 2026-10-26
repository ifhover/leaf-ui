import { Flex, Tabs, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TabsViewSwitcher() {
  const [view, setView] = useState('week');
  return (
    <Flex direction="column" gap="md">
      <Tabs
        type="card"
        block
        aria-label="统计周期"
        activeKey={view}
        onChange={setView}
        items={[
          { key: 'week', label: '本周' },
          { key: 'month', label: '本月' },
          { key: 'year', label: '全年', disabled: true },
        ]}
      />
      <Text role="status">{view === 'week' ? '显示本周内容。' : '显示本月内容。'}</Text>
    </Flex>
  );
}
