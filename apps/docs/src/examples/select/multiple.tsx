import { Flex, Select, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = [
  { value: 'design', label: '设计工作室' },
  { value: 'product', label: '产品团队' },
  { value: 'engineering', label: '工程团队' },
  { value: 'archived', label: '归档项目', disabled: true },
];

export function SelectMultiple() {
  const [value, setValue] = useState<string[]>(['design']);
  return (
    <Flex direction="column" gap="sm">
      <Select
        aria-label="选择多个团队"
        multiple
        allowClear
        options={options}
        value={value}
        onChange={setValue}
        placeholder="请选择团队"
      />
      <Text tone="muted" role="status">
        当前值：{value.join(', ') || '未选择'}
      </Text>
    </Flex>
  );
}
