import { Flex, Text, TreeSelect } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  {
    value: 'design',
    label: 'Design team',
    children: [
      { value: 'visual', label: 'Visual design' },
      { value: 'product', label: 'Product design' },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering team',
    children: [
      { value: 'web', label: 'Frontend' },
      { value: 'server', label: 'Backend' },
    ],
  },
];

export function TreeSelectChecks() {
  const [children, setChildren] = useState<readonly string[]>(['visual', 'product']);
  const [parents, setParents] = useState<readonly string[]>(['design']);
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Output child values</Text>
        <TreeSelect
          aria-label="Output child values"
          treeCheckable
          options={options}
          value={children}
          onChange={setChildren}
          defaultExpandAll
        />
        <Text tone="muted" role="status">
          Callback values: {children.join(', ') || 'None'}
        </Text>
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Consolidate parent values</Text>
        <TreeSelect
          aria-label="Consolidate parent values"
          treeCheckable
          showCheckedStrategy="parent"
          options={options}
          value={parents}
          onChange={setParents}
          defaultExpandAll
        />
        <Text tone="muted" role="status">
          Callback values: {parents.join(', ') || 'None'}
        </Text>
      </Flex>
    </Flex>
  );
}
