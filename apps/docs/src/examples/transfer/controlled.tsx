import { Flex, Space, Text, Transfer, type TransferItem } from '@ifhover/leaf-ui';
import { useState } from 'react';

const items: TransferItem[] = [
  { key: '1', label: '资源 1' },
  { key: '2', label: '资源 2' },
  { key: '3', label: '资源 3' },
  { key: '4', label: '资源 4' },
  { key: '5', label: '资源 5', disabled: true },
  { key: '6', label: '资源 6' },
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
          右侧项目：{value.join(', ') || '暂无'}
        </Text>
        <Text role="status" tone="muted">
          待移动项目：{selectedKeys.join(', ') || '暂无'}
        </Text>
      </Space>
    </Flex>
  );
}
