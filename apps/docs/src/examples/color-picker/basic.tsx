import { ColorPicker, Space, Text } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ColorPickerBasic() {
  const [color, setColor] = useState('#1e964f');
  return (
    <Space direction="vertical" align="start">
      <ColorPicker value={color} onChange={setColor} showText aria-label="品牌颜色" />
      <Text tone="muted">当前颜色：{color}</Text>
    </Space>
  );
}
