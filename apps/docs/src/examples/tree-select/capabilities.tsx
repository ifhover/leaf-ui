import { Flex, Space, Text, TreeSelect } from '@ifhover/leaf-ui';
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
export function Capabilities({ english = false }) {
  const [expanded, setExpanded] = useState<readonly string[]>(['team']);
  return (
    <Space direction="vertical" align="stretch">
      <Flex direction="column" gap="sm" align="center">
        <Text>
          {english
            ? 'Choose up to two people; keep one tag visible'
            : '最多选择两人，只展示一个标签'}
        </Text>
        <TreeSelect
          aria-label={english ? 'Team members' : '团队成员'}
          popupWidth="auto"
          popupMaxWidth={320}
          treeCheckable
          options={options}
          maxCount={2}
          maxTagCount={1}
          treeExpandedKeys={expanded}
          onExpand={setExpanded}
          nodeRender={(node) => <strong>{node.label}</strong>}
          filterTreeNode={(node, query) =>
            String(node.label).toLowerCase().includes(query.toLowerCase())
          }
          showSearch
        />
      </Flex>
    </Space>
  );
}
