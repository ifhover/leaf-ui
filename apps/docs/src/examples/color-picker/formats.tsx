import { ColorPicker, Flex, FormField } from '@ifhover/leaf-ui';

export function ColorPickerFormats() {
  return (
    <Flex direction="column" gap="lg">
      {(['hex', 'rgb', 'hsl'] as const).map((format) => (
        <FormField key={format} layout="vertical" label={format.toUpperCase()}>
          <ColorPicker defaultFormat={format} showText />
        </FormField>
      ))}
    </Flex>
  );
}
