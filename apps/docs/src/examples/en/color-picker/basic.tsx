import { ColorPicker, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ColorPickerBasic() {
  const [color, setColor] = useState('#20834a');
  return (
    <Space direction="vertical" align="start">
      <ColorPicker value={color} onChange={setColor} showText aria-label="Brand color" />
      <Text tone="muted">Current color：{color}</Text>
    </Space>
  );
}
