import { ColorPicker, Flex, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';

export function ColorPickerControlled() {
  const [color, setColor] = useState('#1e964f');

  return (
    <Flex direction="column" gap="md" align="start">
      <ColorPicker value={color} onChange={setColor} allowClear showText aria-label="可清除颜色" />
      <Text tone="muted" role="status">
        当前颜色：{color || '未选择'}
      </Text>
    </Flex>
  );
}
