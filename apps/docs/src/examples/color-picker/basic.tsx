import { ColorPicker } from '@sudden3/leaf-ui';
import { useState } from 'react';
export function ColorPickerBasic() {
  const [color, setColor] = useState('#20834a');
  return (
    <div className="leaf-demo-stack">
      <ColorPicker value={color} onChange={setColor} showText aria-label="品牌颜色" />
      <div className="leaf-demo-surface" style={{ borderColor: color, color }}>
        你的品牌，你的颜色。
      </div>
    </div>
  );
}
