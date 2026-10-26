import { Flex, Text, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  {
    value: 'team',
    label: '团队',
    children: [
      { value: 'alice', label: 'Alice' },
      { value: 'bob', label: 'Bob' },
      { value: 'carol', label: 'Carol' },
    ],
  },
];

export function SelectLimit() {
  const [value, setValue] = useState<readonly string[]>(['alice']);
  return (
    <Flex direction="column" gap="sm">
      <TreeSelect
        aria-label="最多选择两人"
        treeCheckable
        maxCount={2}
        options={options}
        value={value}
        onChange={setValue}
        defaultExpandAll
        placeholder="最多选择两人"
      />
      <Text tone="muted" role="status">
        已选择：{value.length} / 2
      </Text>
    </Flex>
  );
}
