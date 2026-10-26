import { Flex, Mentions, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'ada', label: 'Ada Lovelace' },
  { value: 'lin', label: 'Lin Chen' },
];

export function MentionsControlled() {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState('');
  return (
    <Flex direction="column" gap="sm">
      <Mentions
        aria-label="Controlled comment"
        value={value}
        onChange={setValue}
        onSelect={(option, prefix) => setSelected(`${prefix}${option.value}`)}
        options={options}
        placeholder="Type @ to choose a member"
      />
      <Text tone="muted" role="status">
        Last inserted: {selected || 'None yet'}
      </Text>
    </Flex>
  );
}
