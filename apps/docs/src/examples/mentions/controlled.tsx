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
        aria-label="受控评论"
        value={value}
        onChange={setValue}
        onSelect={(option, prefix) => setSelected(`${prefix}${option.value}`)}
        options={options}
        placeholder="输入 @ 选择成员"
      />
      <Text tone="muted" role="status">
        最近插入：{selected || '尚未插入'}
      </Text>
    </Flex>
  );
}
