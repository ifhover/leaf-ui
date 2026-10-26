import { ColorPicker, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ColorPickerControlled() {
  const [color, setColor] = useState('#1e964f');

  return (
    <Flex direction="column" gap="md" align="start">
      <ColorPicker
        value={color}
        onChange={setColor}
        allowClear
        showText
        aria-label="Clearable color"
      />
      <Text tone="muted" role="status">
        Current color: {color || 'Empty'}
      </Text>
    </Flex>
  );
}
