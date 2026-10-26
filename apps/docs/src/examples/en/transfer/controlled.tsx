import { Flex, Space, Text, Transfer, type TransferItem } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items: TransferItem[] = [
  { key: '1', label: 'Resource 1' },
  { key: '2', label: 'Resource 2' },
  { key: '3', label: 'Resource 3' },
  { key: '4', label: 'Resource 4' },
  { key: '5', label: 'Resource 5', disabled: true },
  { key: '6', label: 'Resource 6' },
];

export function TransferControlled() {
  const [value, setValue] = useState<string[]>(['2', '4']);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  return (
    <Flex justify="center">
      <Space direction="vertical" align="stretch">
        <Transfer
          items={items}
          value={value}
          onChange={setValue}
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        />
        <Text role="status" tone="muted">
          Right-side keys: {value.join(', ') || 'None'}
        </Text>
        <Text role="status" tone="muted">
          Checked keys: {selectedKeys.join(', ') || 'None'}
        </Text>
      </Space>
    </Flex>
  );
}
