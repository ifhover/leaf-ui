import { ColorPicker, type ColorPreset } from '@ifhover/leaf-ui';

const presets: readonly ColorPreset[] = [
  { label: 'Brand colors', colors: ['#1e964f', '#1677ff', '#f49b23'] },
  { label: 'Neutral colors', colors: ['#203329', '#6c7c71', '#dce5de', '#ffffff'] },
];

export function ColorPickerPresets() {
  return <ColorPicker presets={presets} showText aria-label="Choose a preset color" />;
}
