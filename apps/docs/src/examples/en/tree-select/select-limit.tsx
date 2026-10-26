import { Flex, Text, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  {
    value: 'team',
    label: 'Team',
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
        aria-label="Choose up to two people"
        treeCheckable
        maxCount={2}
        options={options}
        value={value}
        onChange={setValue}
        defaultExpandAll
        placeholder="Choose up to two people"
      />
      <Text tone="muted" role="status">
        Selected: {value.length} / 2
      </Text>
    </Flex>
  );
}
