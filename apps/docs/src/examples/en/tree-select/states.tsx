import { Flex, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';

const treeOptions: readonly TreeSelectOption[] = [
  {
    value: 'design',
    label: 'Design team',
    selectable: false,
    children: [
      { value: 'visual', label: 'Visual design' },
      { value: 'product', label: 'Product design' },
      { value: 'archive', label: 'Archived team', disabled: true },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering team',
    selectable: false,
    children: [
      { value: 'web', label: 'Frontend development' },
      { value: 'server', label: 'Backend development' },
    ],
  },
];

export function TreeSelectStates() {
  return (
    <Flex direction="column" gap="md">
      <Flex direction="column" gap="sm">
        <Text tone="muted">Disabled</Text>
        <TreeSelect
          aria-label="Disabled team selection"
          options={treeOptions}
          disabled
          defaultValue="web"
        />
      </Flex>
      <Flex direction="column" gap="sm">
        <Text tone="muted">Error</Text>
        <TreeSelect
          aria-label="Team selection with an error"
          options={treeOptions}
          status="error"
          placeholder="Select a team"
        />
      </Flex>
    </Flex>
  );
}
