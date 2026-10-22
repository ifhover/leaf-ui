import type { ColorPreset } from '@ifhover/leaf-ui';
import { ColorPicker, Flex, Text } from '@ifhover/leaf-ui';

const presets: readonly ColorPreset[] = [
  { label: 'Brand colors', colors: ['#1e964f', '#1677ff', '#7654c6', '#f49b23'] },
  { label: 'Neutral colors', colors: ['#203329', '#6c7c71', '#dce5de', '#ffffff'] },
];
export function ColorPickerPresets() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>Custom presets · Clearable</Text>
        <ColorPicker presets={presets} allowClear showText />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>Disabled</Text>
        <ColorPicker disabled defaultValue="#1677ff" showText />
      </Flex>
    </Flex>
  );
}
