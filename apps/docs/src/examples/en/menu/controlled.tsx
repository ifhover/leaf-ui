import { Flex, Menu, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function MenuControlled() {
  const [selectedKey, setSelectedKey] = useState('home');

  return (
    <Flex direction="column" gap="md">
      <Menu
        selectedKey={selectedKey}
        onSelect={setSelectedKey}
        items={[
          { key: 'home', label: 'Home' },
          { key: 'projects', label: 'Projects' },
          { key: 'settings', label: 'Settings' },
        ]}
      />
      <Text tone="muted" role="status">
        Selected key: {selectedKey}
      </Text>
    </Flex>
  );
}
