import { Flex, RadioGroup, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function RadioControlled() {
  const [value, setValue] = useState('daily');
  return (
    <Flex direction="column" gap="md" align="start">
      <RadioGroup
        label="提醒频率"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        options={[
          { label: '每天', value: 'daily' },
          { label: '每周', value: 'weekly' },
          { label: '仅重要消息', value: 'important' },
        ]}
      />
      <Text tone="muted" role="status">
        当前选择：{value}
      </Text>
    </Flex>
  );
}
