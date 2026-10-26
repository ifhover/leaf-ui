import { ColorPicker } from '@ifhover/leaf-ui';

export function ColorPickerGradient() {
  return (
    <ColorPicker
      mode="gradient"
      defaultValue="linear-gradient(90deg, #1e964f 0%, #83cf9e 100%)"
      showText
      aria-label="渐变颜色"
    />
  );
}
