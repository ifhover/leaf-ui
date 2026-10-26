import { Flex, RadioGroup, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function RadioControlled() {
  const [value, setValue] = useState('daily');
  return (
    <Flex direction="column" gap="md" align="start">
      <RadioGroup
        label="Notification frequency"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        options={[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Important messages only', value: 'important' },
        ]}
      />
      <Text tone="muted" role="status">
        Selected: {value}
      </Text>
    </Flex>
  );
}
