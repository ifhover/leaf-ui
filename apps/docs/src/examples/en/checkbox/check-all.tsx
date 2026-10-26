import { Checkbox, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

const options = ['Design updates', 'Product news', 'Weekly updates'];

export function CheckboxCheckAll() {
  const [selected, setSelected] = useState<string[]>(['Design updates']);
  const allChecked = selected.length === options.length;
  return (
    <Flex direction="column" gap="md" align="start">
      <Checkbox
        checked={allChecked}
        indeterminate={selected.length > 0 && !allChecked}
        onChange={(event) => setSelected(event.target.checked ? [...options] : [])}
      >
        Subscribe to all
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
        Selected {selected.length} items
      </Text>
    </Flex>
  );
}
