import { Button, Flex, Text, TreeSelect, type TreeSelectOption } from '@ifhover/leaf-ui';
import { useState } from 'react';

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

export function TreeSelectControlled() {
  const [value, setValue] = useState<string | null>('visual');
  return (
    <Flex direction="column" gap="sm">
      <TreeSelect
        aria-label="Controlled team"
        options={treeOptions}
        value={value}
        onChange={setValue}
        defaultExpandAll
        placeholder="Select a team"
      />
      <Text tone="muted" role="status">
        Current value: {value ?? 'None'}
      </Text>
      <Flex>
        <Button variant="outline" onClick={() => setValue('visual')}>
          Reset
        </Button>
      </Flex>
    </Flex>
  );
}
