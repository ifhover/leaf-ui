import type { ColorPreset } from '@ifhover/leaf-ui';
import { ColorPicker, Flex, Text } from '@ifhover/leaf-ui';

const presets: readonly ColorPreset[] = [
  { label: '品牌颜色', colors: ['#20834a', '#1677ff', '#7654c6', '#f49b23'] },
  { label: '中性色', colors: ['#203329', '#6c7c71', '#dce5de', '#ffffff'] },
];
export function ColorPickerPresets() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>自定义预设 · 可清除</Text>
        <ColorPicker presets={presets} allowClear showText />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>禁用</Text>
        <ColorPicker disabled defaultValue="#1677ff" showText />
      </Flex>
    </Flex>
  );
}
