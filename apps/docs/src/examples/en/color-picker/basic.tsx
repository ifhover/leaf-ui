import { ColorPicker, Space } from '@ifhover/leaf-ui';
import { useState } from 'react';
export function ColorPickerBasic() {
  const [color, setColor] = useState('#20834a');
  return (
    <Space direction="vertical" align="stretch" className="leaf-demo-stack">
      <ColorPicker value={color} onChange={setColor} showText aria-label="Brand color" />
      <div className="leaf-demo-surface" style={{ borderColor: color, color }}>
        Your brand, your color.
      </div>
    </Space>
  );
}
