import { ColorPicker, type ColorPreset } from '@sudden3/leaf-ui';

const presets: readonly ColorPreset[] = [
  { label: '品牌颜色', colors: ['#20834a', '#1677ff', '#7654c6', '#f49b23'] },
  { label: '中性色', colors: ['#203329', '#6c7c71', '#dce5de', '#ffffff'] },
];
export function ColorPickerPresets() {
  return (
    <div className="leaf-demo-row">
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">自定义预设 · 可清除</span>
        <ColorPicker presets={presets} allowClear showText />
      </div>
      <div className="leaf-demo-case">
        <span className="leaf-demo-label">禁用</span>
        <ColorPicker disabled defaultValue="#1677ff" showText />
      </div>
    </div>
  );
}
