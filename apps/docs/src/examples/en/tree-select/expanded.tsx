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

export function Expanded() {
  const [expanded, setExpanded] = useState<readonly string[]>(['team']);
  return (
    <Flex direction="column" gap="sm">
      <TreeSelect
        aria-label="Team with controlled expansion"
        options={options}
        treeExpandedKeys={expanded}
        onExpand={setExpanded}
        placeholder="Select a member"
      />
      <Text tone="muted" role="status">
        Expanded nodes: {expanded.join(', ') || 'None'}
      </Text>
    </Flex>
  );
}
