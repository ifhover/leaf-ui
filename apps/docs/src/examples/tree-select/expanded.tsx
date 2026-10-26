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

export function Expanded() {
  const [expanded, setExpanded] = useState<readonly string[]>(['team']);
  return (
    <Flex direction="column" gap="sm">
      <TreeSelect
        aria-label="受控展开的团队"
        options={options}
        treeExpandedKeys={expanded}
        onExpand={setExpanded}
        placeholder="选择成员"
      />
      <Text tone="muted" role="status">
        展开节点：{expanded.join(', ') || '无'}
      </Text>
    </Flex>
  );
}
