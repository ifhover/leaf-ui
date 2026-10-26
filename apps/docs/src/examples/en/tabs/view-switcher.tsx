import { Flex, Tabs, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function TabsViewSwitcher() {
  const [view, setView] = useState('week');
  return (
    <Flex direction="column" gap="md">
      <Tabs
        type="card"
        block
        aria-label="Statistics period"
        activeKey={view}
        onChange={setView}
        items={[
          { key: 'week', label: 'Week' },
          { key: 'month', label: 'Month' },
          { key: 'year', label: 'Year', disabled: true },
        ]}
      />
      <Text role="status">{view === 'week' ? 'Showing this week.' : 'Showing this month.'}</Text>
    </Flex>
  );
}
