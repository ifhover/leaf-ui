import { Flex, Text, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  {
    value: 'design',
    label: '设计团队',
    children: [
      { value: 'visual', label: '视觉设计' },
      { value: 'product', label: '产品设计' },
    ],
  },
  {
    value: 'engineering',
    label: '研发团队',
    children: [
      { value: 'web', label: '前端' },
      { value: 'server', label: '后端' },
    ],
  },
];

export function TreeSelectChecks() {
  const [children, setChildren] = useState<readonly string[]>(['visual', 'product']);
  const [parents, setParents] = useState<readonly string[]>(['design']);
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">输出子节点</Text>
        <TreeSelect
          aria-label="输出子节点"
          treeCheckable
          options={options}
          value={children}
          onChange={setChildren}
          defaultExpandAll
        />
        <Text tone="muted" role="status">
          回调值：{children.join(', ') || '未选择'}
        </Text>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">合并为父节点</Text>
        <TreeSelect
          aria-label="合并为父节点"
          treeCheckable
          showCheckedStrategy="parent"
          options={options}
          value={parents}
          onChange={setParents}
          defaultExpandAll
        />
        <Text tone="muted" role="status">
          回调值：{parents.join(', ') || '未选择'}
        </Text>
      </Flex>
    </Flex>
  );
}
