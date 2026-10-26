import { Flex, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'design', label: 'Design studio' },
  { value: 'product', label: 'Product team' },
  { value: 'engineering', label: 'Engineering team' },
  { value: 'archived', label: 'Archived project', disabled: true },
];

export function SelectMultiple() {
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Flex direction="column" gap="sm">
      <Select
        aria-label="Choose teams"
        multiple
        allowClear
        options={options}
        value={value}
        onChange={setValue}
        placeholder="Select teams"
      />
      <Text tone="muted" role="status">
        Current values: {value.join(', ') || 'None'}
      </Text>
    </Flex>
  );
}
