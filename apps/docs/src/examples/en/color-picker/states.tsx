import { ColorPicker, Flex, FormField } from '@ifhover/leaf-ui';

export function ColorPickerStates() {
  return (
    <Flex direction="column" gap="lg">
      <FormField layout="vertical" label="Disabled">
        <ColorPicker disabled showText />
      </FormField>
      <FormField layout="vertical" label="Read-only">
        <ColorPicker readOnly showText />
      </FormField>
      <FormField layout="vertical" label="Error state">
        <ColorPicker status="error" showText />
      </FormField>
    </Flex>
  );
}
