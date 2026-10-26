import { ColorPicker, type ColorPreset } from '@ifhover/leaf-ui';

const presets: readonly ColorPreset[] = [
  { label: '品牌颜色', colors: ['#1e964f', '#1677ff', '#f49b23'] },
  { label: '中性色', colors: ['#203329', '#6c7c71', '#dce5de', '#ffffff'] },
];

export function ColorPickerPresets() {
  return <ColorPicker presets={presets} showText aria-label="选择预设颜色" />;
}
