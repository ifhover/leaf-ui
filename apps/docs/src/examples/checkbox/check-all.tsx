import { Checkbox, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = ['设计更新', '产品动态', '每周摘要'];

export function CheckboxCheckAll() {
  const [selected, setSelected] = useState<string[]>(['设计更新']);
  const allChecked = selected.length === options.length;
  return (
    <Flex direction="column" gap="md" align="start">
      <Checkbox
        checked={allChecked}
        indeterminate={selected.length > 0 && !allChecked}
        onChange={(event) => setSelected(event.target.checked ? [...options] : [])}
      >
        订阅全部
      </Checkbox>
      <Flex direction="column" gap="sm" align="start">
        {options.map((option) => (
          <Checkbox
            key={option}
            checked={selected.includes(option)}
            onChange={(event) =>
              setSelected(
                event.target.checked
                  ? [...selected, option]
                  : selected.filter((item) => item !== option),
              )
            }
          >
            {option}
          </Checkbox>
        ))}
      </Flex>
      <Text tone="muted" role="status">
        已选择 {selected.length} 项
      </Text>
    </Flex>
  );
}
