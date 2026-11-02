import { Button, ColorPicker } from '@ifhover/leaf-ui';
import { Palette } from 'lucide-react';
import { useState } from 'react';

export function ColorPickerCustomTrigger() {
  const [color, setColor] = useState('#1677ff');
  return (
    <ColorPicker value={color} onChange={setColor}>
      <Button startIcon={<Palette />}>Choose color {color}</Button>
    </ColorPicker>
  );
}
