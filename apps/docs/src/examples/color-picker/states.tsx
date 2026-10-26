import { ColorPicker, Flex, FormField } from '@ifhover/leaf-ui';

export function ColorPickerStates() {
  return (
    <Flex direction="column" gap="lg">
      <FormField layout="vertical" label="禁用">
        <ColorPicker disabled showText />
      </FormField>
      <FormField layout="vertical" label="只读">
        <ColorPicker readOnly showText />
      </FormField>
      <FormField layout="vertical" label="错误状态">
        <ColorPicker status="error" showText />
      </FormField>
    </Flex>
  );
}
