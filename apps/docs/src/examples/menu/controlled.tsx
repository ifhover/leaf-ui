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
          { key: 'home', label: '首页' },
          { key: 'projects', label: '项目' },
          { key: 'settings', label: '设置' },
        ]}
      />
      <Text tone="muted" role="status">
        当前选中：{selectedKey}
      </Text>
    </Flex>
  );
}
