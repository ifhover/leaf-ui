import { ColorPicker, Flex, FormField } from '@ifhover/leaf-ui';

export function ColorPickerAlpha() {
  return (
    <Flex direction="column" gap="lg">
      <FormField layout="vertical" label="Translucent color">
        <ColorPicker defaultValue="rgba(30, 150, 79, 0.5)" showText />
      </FormField>
      <FormField layout="vertical" label="Opaque color">
        <ColorPicker defaultValue="rgba(30, 150, 79, 0.5)" disableAlpha showText />
      </FormField>
    </Flex>
  );
}
