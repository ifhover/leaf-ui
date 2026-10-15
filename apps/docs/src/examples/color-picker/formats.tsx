import { ColorPicker, Flex, Text } from '@ifhover/leaf-ui';
export function ColorPickerFormats() {
  return (
    <Flex gap="md" align="center" wrap justify="center">
      <Flex direction="column" gap="sm" align="start">
        <Text>HEX</Text>
        <ColorPicker defaultValue="#1677ff" showText />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>RGB · 半透明</Text>
        <ColorPicker defaultValue="rgba(118, 84, 198, 0.6)" defaultFormat="rgb" showText />
      </Flex>
      <Flex direction="column" gap="sm" align="start">
        <Text>HSL · 不透明</Text>
        <ColorPicker defaultValue="hsl(35, 91%, 55%)" defaultFormat="hsl" disableAlpha showText />
      </Flex>
    </Flex>
  );
}
